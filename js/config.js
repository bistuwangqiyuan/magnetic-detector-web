/**
 * 磁检测仪器网页版 - 配置文件
 * 包含Supabase配置、应用配置和常量定义
 */

// ==================== Supabase 配置 ====================
const SUPABASE_CONFIG = {
    url: 'https://zzyueuweeoakopuuwfau.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4'
};

// ==================== 应用配置 ====================
const APP_CONFIG = {
    // 应用基本信息
    appName: '磁检测仪器网页版',
    version: '1.0.0',
    defaultOperator: 'System',
    
    // 采样配置
    sampling: {
        minRate: 10,        // 最小采样频率 (Hz)
        maxRate: 10000,     // 最大采样频率 (Hz)
        defaultRate: 2000,  // 默认采样频率 (Hz)
        minPoints: 1000,    // 最小采样点数
        maxPoints: 10000,   // 最大采样点数
        defaultPoints: 5000 // 默认采样点数
    },
    
    // 检测配置
    detection: {
        minSensitivity: 1,      // 最小灵敏度
        maxSensitivity: 10,     // 最大灵敏度
        defaultSensitivity: 7,  // 默认灵敏度
        minGate: 0,             // 最小门限 (%)
        maxGate: 100,           // 最大门限 (%)
        defaultUpperGate: 80,   // 默认上门限 (%)
        defaultLowerGate: 20    // 默认下门限 (%)
    },
    
    // 显示配置
    display: {
        scanTypes: ['A-SCAN', 'B-SCAN', 'C-SCAN'],
        defaultScanType: 'B-SCAN',
        colorSchemes: ['green', 'yellow', 'multi'],
        defaultColorScheme: 'green',
        refreshRate: 30,        // 刷新率 (fps)
        gridSize: 50           // 网格大小 (px)
    },
    
    // 波形生成配置
    waveform: {
        baseAmplitude: 50,      // 基准幅值
        noiseLevel: 5,          // 噪声水平
        defectProbability: 0.1, // 缺陷出现概率
        defectTypes: [
            'surface_crack',
            'internal_crack',
            'porosity',
            'inclusion'
        ]
    },
    
    // 缺陷判定阈值
    defectThresholds: {
        minor: { min: 20, max: 40 },
        moderate: { min: 40, max: 70 },
        severe: { min: 70, max: 100 }
    },
    
    // 数据存储配置
    storage: {
        autoSaveInterval: 30000,    // 自动保存间隔 (ms)
        maxRecords: 1000,           // 最大记录数
        dataRetentionDays: 365      // 数据保留天数
    },
    
    // 报告配置
    report: {
        defaultTemplate: 'standard',
        pageSize: 'A4',
        orientation: 'portrait',
        includeWaveform: true,
        includeStatistics: true
    }
};

// ==================== 缺陷类型定义 ====================
const DEFECT_TYPES = {
    surface_crack: {
        name: '表面裂纹',
        icon: '⚡',
        color: '#FF0000',
        description: '材料表面的裂纹缺陷'
    },
    internal_crack: {
        name: '内部裂纹',
        icon: '💥',
        color: '#FF6600',
        description: '材料内部的裂纹缺陷'
    },
    porosity: {
        name: '气孔',
        icon: '⭕',
        color: '#FFAA00',
        description: '材料中的气孔缺陷'
    },
    inclusion: {
        name: '夹杂',
        icon: '◆',
        color: '#FFDD00',
        description: '材料中的夹杂物'
    },
    fold: {
        name: '折叠',
        icon: '〰️',
        color: '#FFA500',
        description: '材料的折叠缺陷'
    },
    overlap: {
        name: '重皮',
        icon: '≋',
        color: '#FF8C00',
        description: '材料的重皮缺陷'
    }
};

// ==================== 测试模板定义 ====================
const TEST_TEMPLATES = {
    steel_pipe: {
        name: '钢管标准检测',
        type: '钢管检测',
        parameters: {
            sampling_rate: 2000,
            sensitivity: 7,
            upper_gate: 80.0,
            lower_gate: 20.0,
            scan_type: 'B-SCAN',
            noise_suppression: true
        }
    },
    weld_seam: {
        name: '钢板焊缝检测',
        type: '焊缝检测',
        parameters: {
            sampling_rate: 5000,
            sensitivity: 8,
            upper_gate: 75.0,
            lower_gate: 25.0,
            scan_type: 'A-SCAN',
            noise_suppression: true
        }
    },
    high_sensitivity: {
        name: '高灵敏度检测',
        type: '精密检测',
        parameters: {
            sampling_rate: 10000,
            sensitivity: 10,
            upper_gate: 70.0,
            lower_gate: 30.0,
            scan_type: 'B-SCAN',
            noise_suppression: false
        }
    }
};

// ==================== UI 常量 ====================
const UI_CONSTANTS = {
    colors: {
        primaryOrange: '#FF6B1A',
        darkGray: '#2A2A2A',
        lightGray: '#F5F5F5',
        warningYellow: '#FFFF00',
        waveformGreen: '#00FF00',
        errorRed: '#FF0000',
        textWhite: '#FFFFFF'
    },
    
    messages: {
        saveSuccess: '数据保存成功',
        saveFailed: '数据保存失败',
        loadSuccess: '数据加载成功',
        loadFailed: '数据加载失败',
        deleteConfirm: '确定要删除这条记录吗？',
        networkError: '网络连接失败，请检查网络设置',
        invalidInput: '输入数据无效，请检查'
    },
    
    icons: {
        play: '▶',
        pause: '⏸',
        stop: '⏹',
        save: '💾',
        load: '📂',
        delete: '🗑️',
        export: '📤',
        print: '🖨️',
        settings: '⚙️',
        warning: '⚠️',
        success: '✓',
        error: '✗'
    }
};

// ==================== 工具函数 ====================
/**
 * 获取当前时间戳
 * @returns {number} 时间戳（毫秒）
 */
function getCurrentTimestamp() {
    return Date.now();
}

/**
 * 格式化日期时间
 * @param {Date|number} date - 日期对象或时间戳
 * @param {string} format - 格式化字符串
 * @returns {string} 格式化后的日期时间
 */
function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = date instanceof Date ? date : new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 生成UUID
 * @returns {string} UUID字符串
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 深度克隆对象
 * @param {any} obj - 要克隆的对象
 * @returns {any} 克隆后的对象
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 显示加载状态
 * @param {boolean} show - 是否显示
 */
function showLoading(show = true) {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay && show) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(overlay);
    }
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (success/warning/danger/info)
 * @param {number} duration - 显示时长（毫秒）
 */
function showMessage(message, type = 'info', duration = 3000) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 250px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, duration);
}

// ==================== 日志工具 ====================
const Logger = {
    debug: (...args) => console.log('[DEBUG]', ...args),
    info: (...args) => console.info('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args)
};

// ==================== 导出配置 ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_CONFIG,
        APP_CONFIG,
        DEFECT_TYPES,
        TEST_TEMPLATES,
        UI_CONSTANTS,
        getCurrentTimestamp,
        formatDateTime,
        generateUUID,
        deepClone,
        debounce,
        throttle,
        showLoading,
        showMessage,
        Logger
    };
}

// 添加动画样式
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

console.log(`%c${APP_CONFIG.appName} v${APP_CONFIG.version}`, 'color: #FF6B1A; font-size: 16px; font-weight: bold;');
console.log('%c系统配置加载完成', 'color: #00FF00;');
