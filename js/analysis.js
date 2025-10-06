/**
 * 磁检测仪器网页版 - 数据分析功能
 * FFT频谱分析、统计分析、趋势分析
 */

// ==================== 统计分析类 ====================
class StatisticalAnalyzer {
    /**
     * 计算均值
     * @param {Array} data - 数据数组
     * @returns {number} 均值
     */
    static mean(data) {
        if (data.length === 0) return 0;
        const sum = data.reduce((acc, val) => acc + val, 0);
        return sum / data.length;
    }

    /**
     * 计算标准差
     * @param {Array} data - 数据数组
     * @returns {number} 标准差
     */
    static std(data) {
        if (data.length === 0) return 0;
        const avg = this.mean(data);
        const squareDiffs = data.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = this.mean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * 计算最大值
     */
    static max(data) {
        return Math.max(...data);
    }

    /**
     * 计算最小值
     */
    static min(data) {
        return Math.min(...data);
    }

    /**
     * 计算峰峰值
     */
    static peakToPeak(data) {
        return this.max(data) - this.min(data);
    }

    /**
     * 完整统计分析
     * @param {Array} data - 波形数据
     * @returns {Object} 统计结果
     */
    static analyze(data) {
        const values = data.map(d => d.y || d);
        
        return {
            mean: this.mean(values).toFixed(2),
            std: this.std(values).toFixed(2),
            max: this.max(values).toFixed(2),
            min: this.min(values).toFixed(2),
            peakToPeak: this.peakToPeak(values).toFixed(2),
            count: values.length
        };
    }
}

// ==================== FFT频谱分析 ====================
class FFTAnalyzer {
    /**
     * 简化的FFT实现（用于演示）
     * 实际应用建议使用专业库如fft.js
     * @param {Array} data - 时域数据
     * @returns {Array} 频域数据
     */
    static simpleFFT(data) {
        const N = data.length;
        const spectrum = [];
        
        // 简化的DFT实现（仅用于演示）
        for (let k = 0; k < N / 2; k++) {
            let real = 0;
            let imag = 0;
            
            for (let n = 0; n < N; n++) {
                const angle = (2 * Math.PI * k * n) / N;
                real += data[n] * Math.cos(angle);
                imag += data[n] * Math.sin(angle);
            }
            
            const magnitude = Math.sqrt(real * real + imag * imag) / N;
            spectrum.push({
                frequency: k,
                magnitude: magnitude
            });
        }
        
        return spectrum;
    }

    /**
     * 获取主要频率分量
     * @param {Array} spectrum - 频谱数据
     * @param {number} topN - 返回前N个频率
     * @returns {Array} 主要频率
     */
    static getDominantFrequencies(spectrum, topN = 5) {
        return spectrum
            .sort((a, b) => b.magnitude - a.magnitude)
            .slice(0, topN);
    }
}

// ==================== 缺陷分析 ====================
class DefectAnalyzer {
    /**
     * 分析缺陷分布
     * @param {Array} defects - 缺陷列表
     * @returns {Object} 分布统计
     */
    static analyzeDistribution(defects) {
        const typeCount = {};
        const severityCount = { minor: 0, moderate: 0, severe: 0 };
        
        defects.forEach(defect => {
            // 按类型统计
            typeCount[defect.defect_type] = (typeCount[defect.defect_type] || 0) + 1;
            
            // 按严重程度统计
            if (severityCount.hasOwnProperty(defect.defect_severity)) {
                severityCount[defect.defect_severity]++;
            }
        });
        
        return {
            total: defects.length,
            byType: typeCount,
            bySeverity: severityCount
        };
    }

    /**
     * 分析缺陷趋势
     * @param {Array} records - 测试记录列表
     * @returns {Array} 趋势数据
     */
    static analyzeTrend(records) {
        return records.map(record => ({
            date: record.test_date,
            defectCount: record.defect_count,
            result: record.test_result
        }));
    }
}

// ==================== 导出 ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StatisticalAnalyzer,
        FFTAnalyzer,
        DefectAnalyzer
    };
}
