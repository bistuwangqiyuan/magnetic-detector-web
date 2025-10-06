/**
 * 磁检测仪器网页版 - 实时监测逻辑
 * 实时数据采集、缺陷检测和数据保存
 */

class RealtimeMonitor {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.generator = null;
        this.currentRecord = null;
        this.dataBuffer = [];
        this.defectsDetected = [];
        
        // 监测参数
        this.config = {
            samplingRate: APP_CONFIG.sampling.defaultRate,
            sensitivity: APP_CONFIG.detection.defaultSensitivity,
            upperGate: APP_CONFIG.detection.defaultUpperGate,
            lowerGate: APP_CONFIG.detection.defaultLowerGate,
            updateInterval: 1000 / APP_CONFIG.display.refreshRate
        };
        
        // 回调函数
        this.callbacks = {
            onDataUpdate: null,
            onDefectDetected: null,
            onError: null
        };
    }

    /**
     * 启动实时监测
     * @param {Object} testInfo - 测试信息
     */
    async start(testInfo) {
        if (this.isRunning) {
            Logger.warn('实时监测已在运行');
            return;
        }

        try {
            // 创建测试记录
            this.currentRecord = await createTestRecord({
                workpiece_id: testInfo.workpiece_id,
                workpiece_material: testInfo.workpiece_material,
                workpiece_spec: testInfo.workpiece_spec,
                test_type: testInfo.test_type,
                operator: testInfo.operator,
                sampling_rate: this.config.samplingRate,
                sensitivity: this.config.sensitivity,
                upper_gate: this.config.upperGate,
                lower_gate: this.config.lower_gate
            });

            // 初始化波形生成器
            this.generator = new WaveformGenerator({
                samplingRate: this.config.samplingRate,
                points: 1000
            });

            this.isRunning = true;
            this.startDataAcquisition();

            Logger.info('实时监测已启动', this.currentRecord.id);
        } catch (error) {
            Logger.error('启动实时监测失败:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
        }
    }

    /**
     * 停止实时监测
     */
    async stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // 保存最终数据
        await this.saveData();

        // 更新测试记录状态
        if (this.currentRecord) {
            await updateTestRecord(this.currentRecord.id, {
                defect_count: this.defectsDetected.length,
                test_result: this.defectsDetected.length > 0 ? 'fail' : 'pass'
            });
        }

        Logger.info('实时监测已停止');
    }

    /**
     * 开始数据采集
     */
    startDataAcquisition() {
        let position = 0;
        
        this.intervalId = setInterval(() => {
            // 生成一帧数据
            const frameData = this.generator.generate({
                length: 100,
                includeDefects: true
            });

            // 添加到缓冲区
            this.dataBuffer.push({
                position: position,
                timestamp: Date.now(),
                data: frameData.data
            });

            // 检测缺陷
            if (frameData.defects && frameData.defects.length > 0) {
                frameData.defects.forEach(defect => {
                    this.detectDefect(defect, position);
                });
            }

            // 触发数据更新回调
            if (this.callbacks.onDataUpdate) {
                this.callbacks.onDataUpdate(frameData.data);
            }

            position += 100;

            // 每隔一段时间保存数据
            if (this.dataBuffer.length >= 10) {
                this.saveData();
            }
        }, this.config.updateInterval);
    }

    /**
     * 检测缺陷
     * @param {Object} defect - 缺陷信息
     * @param {number} basePosition - 基准位置
     */
    detectDefect(defect, basePosition) {
        const amplitude = 50 + defect.severity * 50;
        
        // 判断是否超过门限
        if (amplitude > this.config.lowerGate && amplitude < this.config.upperGate) {
            return; // 在门限范围内，不算缺陷
        }

        // 确定严重程度
        let severity = 'minor';
        if (amplitude > 70) {
            severity = 'severe';
        } else if (amplitude > 40) {
            severity = 'moderate';
        }

        const defectInfo = {
            type: defect.type,
            severity: severity,
            position: basePosition + defect.position,
            amplitude: amplitude
        };

        this.defectsDetected.push(defectInfo);

        // 触发缺陷检测回调
        if (this.callbacks.onDefectDetected) {
            this.callbacks.onDefectDetected(defectInfo);
        }

        Logger.warn('检测到缺陷:', defectInfo);
    }

    /**
     * 保存数据到数据库
     */
    async saveData() {
        if (!this.currentRecord || this.dataBuffer.length === 0) return;

        try {
            // 保存波形数据
            const waveformPromises = this.dataBuffer.map(frame => 
                saveWaveformData({
                    test_record_id: this.currentRecord.id,
                    position: frame.position,
                    timestamp_ms: frame.timestamp,
                    amplitude: Math.max(...frame.data.map(d => d.y)),
                    data_points: { points: frame.data },
                    scan_type: 'B-SCAN'
                })
            );

            await Promise.all(waveformPromises);

            // 保存缺陷记录
            const defectPromises = this.defectsDetected.map(defect =>
                createDefect({
                    test_record_id: this.currentRecord.id,
                    defect_type: defect.type,
                    defect_severity: defect.severity,
                    position_start: defect.position - 5,
                    position_end: defect.position + 5,
                    amplitude_peak: defect.amplitude,
                    width: 10,
                    auto_detected: true
                })
            );

            await Promise.all(defectPromises);

            // 清空缓冲区
            this.dataBuffer = [];
            this.defectsDetected = [];

            Logger.info('数据保存成功');
        } catch (error) {
            Logger.error('保存数据失败:', error);
        }
    }

    /**
     * 设置回调函数
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase() + event.slice(1)}`)) {
            this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = callback;
        }
    }

    /**
     * 更新配置
     * @param {Object} newConfig - 新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        Logger.info('监测配置已更新', this.config);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RealtimeMonitor };
}
