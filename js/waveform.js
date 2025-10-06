/**
 * 磁检测仪器网页版 - 波形生成与绘制
 * 模拟磁漏信号生成和Canvas高性能绘制
 */

// ==================== 波形生成器类 ====================
class WaveformGenerator {
    constructor(config = {}) {
        this.samplingRate = config.samplingRate || APP_CONFIG.sampling.defaultRate;
        this.points = config.points || APP_CONFIG.sampling.defaultPoints;
        this.baseAmplitude = config.baseAmplitude || APP_CONFIG.waveform.baseAmplitude;
        this.noiseLevel = config.noiseLevel || APP_CONFIG.waveform.noiseLevel;
        this.defectProbability = config.defectProbability || APP_CONFIG.waveform.defectProbability;
    }

    /**
     * 生成基础磁信号波形
     * @param {number} length - 数据点数量
     * @returns {Array} 波形数据数组
     */
    generateBaseSignal(length = this.points) {
        const data = [];
        for (let i = 0; i < length; i++) {
            // 基础信号: 低频正弦波 + 随机噪声
            const t = i / this.samplingRate;
            const signal = this.baseAmplitude * (0.8 + 0.2 * Math.sin(2 * Math.PI * 5 * t));
            const noise = (Math.random() - 0.5) * this.noiseLevel;
            data.push({
                x: i,
                y: signal + noise,
                time: t
            });
        }
        return data;
    }

    /**
     * 模拟缺陷信号
     * @param {string} defectType - 缺陷类型
     * @param {number} position - 缺陷位置
     * @param {number} severity - 严重程度 (0-1)
     * @returns {Object} 缺陷信号特征
     */
    generateDefectSignal(defectType, position, severity = 0.5) {
        const defectSignals = {
            surface_crack: {
                shape: 'spike',
                width: 5,
                amplitude: 80 + severity * 20,
                rise: 2,
                fall: 3
            },
            internal_crack: {
                shape: 'broad_peak',
                width: 15,
                amplitude: 60 + severity * 20,
                rise: 5,
                fall: 10
            },
            porosity: {
                shape: 'round_peak',
                width: 10,
                amplitude: 40 + severity * 20,
                rise: 5,
                fall: 5
            },
            inclusion: {
                shape: 'irregular',
                width: 12,
                amplitude: 30 + severity * 30,
                rise: 4,
                fall: 8
            }
        };

        return defectSignals[defectType] || defectSignals.surface_crack;
    }

    /**
     * 在波形中添加缺陷
     * @param {Array} waveformData - 原始波形数据
     * @param {Array} defects - 缺陷列表
     * @returns {Array} 带缺陷的波形数据
     */
    addDefects(waveformData, defects) {
        const result = [...waveformData];
        
        defects.forEach(defect => {
            const { position, type, severity } = defect;
            const signal = this.generateDefectSignal(type, position, severity);
            
            // 在指定位置添加缺陷信号
            const startIdx = Math.max(0, Math.floor(position - signal.width / 2));
            const endIdx = Math.min(result.length, Math.floor(position + signal.width / 2));
            
            for (let i = startIdx; i < endIdx; i++) {
                const relativePos = (i - position) / signal.width;
                let defectAmplitude = 0;
                
                // 根据缺陷形状生成信号
                if (signal.shape === 'spike') {
                    defectAmplitude = signal.amplitude * Math.exp(-Math.pow(relativePos * 4, 2));
                } else if (signal.shape === 'broad_peak') {
                    defectAmplitude = signal.amplitude * Math.exp(-Math.pow(relativePos * 2, 2));
                } else if (signal.shape === 'round_peak') {
                    defectAmplitude = signal.amplitude * (1 - Math.pow(relativePos * 2, 2));
                    if (defectAmplitude < 0) defectAmplitude = 0;
                } else {
                    // irregular
                    defectAmplitude = signal.amplitude * Math.exp(-Math.pow(relativePos * 3, 2)) * (1 + 0.3 * Math.sin(relativePos * 20));
                }
                
                result[i].y += defectAmplitude;
            }
        });
        
        return result;
    }

    /**
     * 生成完整的测试波形数据
     * @param {Object} options - 选项
     * @returns {Object} 完整波形数据
     */
    generate(options = {}) {
        const length = options.length || this.points;
        const includeDefects = options.includeDefects !== false;
        
        // 生成基础信号
        let waveformData = this.generateBaseSignal(length);
        
        // 随机生成缺陷
        const defects = [];
        if (includeDefects) {
            const numDefects = Math.floor(Math.random() * 5);
            for (let i = 0; i < numDefects; i++) {
                if (Math.random() < this.defectProbability) {
                    const defectTypes = Object.keys(DEFECT_TYPES);
                    defects.push({
                        position: Math.random() * length,
                        type: defectTypes[Math.floor(Math.random() * defectTypes.length)],
                        severity: Math.random()
                    });
                }
            }
            
            // 添加缺陷到波形
            waveformData = this.addDefects(waveformData, defects);
        }
        
        return {
            data: waveformData,
            defects: defects,
            metadata: {
                samplingRate: this.samplingRate,
                points: length,
                duration: length / this.samplingRate
            }
        };
    }
}

// ==================== 波形渲染器类 ====================
class WaveformRenderer {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = {
            gridColor: config.gridColor || '#333',
            waveformColor: config.waveformColor || '#00FF00',
            backgroundColor: config.backgroundColor || '#0A0A0A',
            gridSize: config.gridSize || 50,
            showGrid: config.showGrid !== false,
            lineWidth: config.lineWidth || 2,
            glow: config.glow !== false
        };
        
        this.scale = { x: 1, y: 1 };
        this.offset = { x: 0, y: 0 };
        
        // 设置高DPI支持
        this.setupHighDPI();
    }

    /**
     * 设置高DPI支持
     */
    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    /**
     * 清空画布
     */
    clear() {
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.fillRect(0, 0, rect.width, rect.height);
    }

    /**
     * 绘制网格
     */
    drawGrid() {
        if (!this.config.showGrid) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const { width, height } = rect;
        const gridSize = this.config.gridSize;
        
        this.ctx.strokeStyle = this.config.gridColor;
        this.ctx.lineWidth = 0.5;
        this.ctx.globalAlpha = 0.3;
        
        // 绘制垂直线
        for (let x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * 绘制波形
     * @param {Array} waveformData - 波形数据
     * @param {Object} options - 绘制选项
     */
    drawWaveform(waveformData, options = {}) {
        if (!waveformData || waveformData.length === 0) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const { width, height } = rect;
        
        // 计算缩放
        const xScale = width / waveformData.length;
        const yScale = height / 100; // 假设幅值范围0-100
        
        this.ctx.strokeStyle = options.color || this.config.waveformColor;
        this.ctx.lineWidth = this.config.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // 添加发光效果
        if (this.config.glow) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = this.config.waveformColor;
        }
        
        // 绘制波形路径
        this.ctx.beginPath();
        waveformData.forEach((point, index) => {
            const x = index * xScale;
            const y = height - (point.y * yScale);
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.stroke();
        
        // 重置阴影
        if (this.config.glow) {
            this.ctx.shadowBlur = 0;
        }
    }

    /**
     * 绘制门限线
     * @param {number} upperGate - 上门限 (%)
     * @param {number} lowerGate - 下门限 (%)
     */
    drawGates(upperGate, lowerGate) {
        const rect = this.canvas.getBoundingClientRect();
        const { width, height } = rect;
        
        const drawGateLine = (percentage) => {
            const y = height - (percentage * height / 100);
            
            this.ctx.strokeStyle = '#FFFF00';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([10, 5]);
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
            
            this.ctx.setLineDash([]);
        };
        
        drawGateLine(upperGate);
        drawGateLine(lowerGate);
    }

    /**
     * 绘制标尺
     * @param {Object} options - 标尺选项
     */
    drawRulers(options = {}) {
        const rect = this.canvas.getBoundingClientRect();
        const { width, height } = rect;
        
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.font = '10px Arial';
        
        // X轴标尺
        if (options.xAxis) {
            const divisions = options.xDivisions || 5;
            const maxValue = options.xMax || 100;
            
            for (let i = 0; i <= divisions; i++) {
                const x = (width / divisions) * i;
                const value = (maxValue / divisions) * i;
                this.ctx.fillText(value.toFixed(1) + options.xUnit, x + 5, height - 5);
            }
        }
        
        // Y轴标尺
        if (options.yAxis) {
            const divisions = options.yDivisions || 5;
            const maxValue = options.yMax || 100;
            
            for (let i = 0; i <= divisions; i++) {
                const y = height - (height / divisions) * i;
                const value = (maxValue / divisions) * i;
                this.ctx.fillText(value.toFixed(0), 5, y - 5);
            }
        }
    }

    /**
     * 渲染完整场景
     * @param {Object} data - 渲染数据
     */
    render(data) {
        this.clear();
        this.drawGrid();
        
        if (data.waveform) {
            this.drawWaveform(data.waveform);
        }
        
        if (data.gates) {
            this.drawGates(data.gates.upper, data.gates.lower);
        }
        
        if (data.rulers) {
            this.drawRulers(data.rulers);
        }
    }
}

// ==================== 导出 ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WaveformGenerator,
        WaveformRenderer
    };
}
