/**
 * 磁检测仪器网页版 - 数据库操作封装
 * 封装所有Supabase数据库CRUD操作
 */

// Supabase客户端实例
let supabaseClient = null;

// ==================== 初始化 ====================
/**
 * 初始化Supabase客户端
 * @returns {Promise<boolean>} 初始化是否成功
 */
async function initDatabase() {
    try {
        if (typeof supabase === 'undefined') {
            Logger.error('Supabase库未加载');
            return false;
        }
        
        supabaseClient = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        
        Logger.info('Supabase客户端初始化成功');
        return true;
    } catch (error) {
        Logger.error('Supabase客户端初始化失败:', error);
        return false;
    }
}

// ==================== 测试记录操作 ====================
/**
 * 创建测试记录
 * @param {Object} recordData - 测试记录数据
 * @returns {Promise<Object>} 创建的记录
 */
async function createTestRecord(recordData) {
    try {
        const { data, error } = await supabaseClient
            .from('test_records')
            .insert([{
                test_date: recordData.test_date || new Date().toISOString(),
                workpiece_id: recordData.workpiece_id,
                workpiece_material: recordData.workpiece_material,
                workpiece_spec: recordData.workpiece_spec || '',
                test_type: recordData.test_type,
                operator: recordData.operator || APP_CONFIG.defaultOperator,
                sampling_rate: recordData.sampling_rate || APP_CONFIG.sampling.defaultRate,
                sensitivity: recordData.sensitivity || APP_CONFIG.detection.defaultSensitivity,
                upper_gate: recordData.upper_gate || APP_CONFIG.detection.defaultUpperGate,
                lower_gate: recordData.lower_gate || APP_CONFIG.detection.defaultLowerGate,
                defect_count: recordData.defect_count || 0,
                test_result: recordData.test_result || 'pending',
                notes: recordData.notes || ''
            }])
            .select()
            .single();
        
        if (error) throw error;
        Logger.info('测试记录创建成功:', data.id);
        return data;
    } catch (error) {
        Logger.error('创建测试记录失败:', error);
        throw error;
    }
}

/**
 * 查询测试记录列表
 * @param {Object} filters - 筛选条件
 * @param {Object} options - 查询选项（分页、排序等）
 * @returns {Promise<Array>} 测试记录列表
 */
async function getTestRecords(filters = {}, options = {}) {
    try {
        let query = supabaseClient.from('test_records').select('*');
        
        // 应用筛选条件
        if (filters.workpiece_id) {
            query = query.eq('workpiece_id', filters.workpiece_id);
        }
        if (filters.test_type) {
            query = query.eq('test_type', filters.test_type);
        }
        if (filters.test_result) {
            query = query.eq('test_result', filters.test_result);
        }
        if (filters.operator) {
            query = query.eq('operator', filters.operator);
        }
        if (filters.date_from) {
            query = query.gte('test_date', filters.date_from);
        }
        if (filters.date_to) {
            query = query.lte('test_date', filters.date_to);
        }
        
        // 排序
        const orderBy = options.orderBy || 'test_date';
        const orderDir = options.orderDir || 'desc';
        query = query.order(orderBy, { ascending: orderDir === 'asc' });
        
        // 分页
        if (options.limit) {
            query = query.limit(options.limit);
        }
        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        Logger.info(`查询到${data.length}条测试记录`);
        return data;
    } catch (error) {
        Logger.error('查询测试记录失败:', error);
        throw error;
    }
}

/**
 * 获取单个测试记录
 * @param {string} recordId - 记录ID
 * @returns {Promise<Object>} 测试记录
 */
async function getTestRecord(recordId) {
    try {
        const { data, error } = await supabaseClient
            .from('test_records')
            .select('*')
            .eq('id', recordId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        Logger.error('获取测试记录失败:', error);
        throw error;
    }
}

/**
 * 更新测试记录
 * @param {string} recordId - 记录ID
 * @param {Object} updates - 更新数据
 * @returns {Promise<Object>} 更新后的记录
 */
async function updateTestRecord(recordId, updates) {
    try {
        const { data, error } = await supabaseClient
            .from('test_records')
            .update(updates)
            .eq('id', recordId)
            .select()
            .single();
        
        if (error) throw error;
        Logger.info('测试记录更新成功:', recordId);
        return data;
    } catch (error) {
        Logger.error('更新测试记录失败:', error);
        throw error;
    }
}

/**
 * 删除测试记录
 * @param {string} recordId - 记录ID
 * @returns {Promise<boolean>} 是否删除成功
 */
async function deleteTestRecord(recordId) {
    try {
        const { error } = await supabaseClient
            .from('test_records')
            .delete()
            .eq('id', recordId);
        
        if (error) throw error;
        Logger.info('测试记录删除成功:', recordId);
        return true;
    } catch (error) {
        Logger.error('删除测试记录失败:', error);
        throw error;
    }
}

// ==================== 波形数据操作 ====================
/**
 * 保存波形数据
 * @param {Object} waveformData - 波形数据
 * @returns {Promise<Object>} 保存的数据
 */
async function saveWaveformData(waveformData) {
    try {
        const { data, error } = await supabaseClient
            .from('waveform_data')
            .insert([{
                test_record_id: waveformData.test_record_id,
                position: waveformData.position || 0,
                timestamp_ms: waveformData.timestamp_ms || 0,
                amplitude: waveformData.amplitude,
                data_points: waveformData.data_points,
                scan_type: waveformData.scan_type || 'B-SCAN'
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        Logger.error('保存波形数据失败:', error);
        throw error;
    }
}

/**
 * 获取测试记录的波形数据
 * @param {string} testRecordId - 测试记录ID
 * @returns {Promise<Array>} 波形数据列表
 */
async function getWaveformData(testRecordId) {
    try {
        const { data, error } = await supabaseClient
            .from('waveform_data')
            .select('*')
            .eq('test_record_id', testRecordId)
            .order('position', { ascending: true });
        
        if (error) throw error;
        return data;
    } catch (error) {
        Logger.error('获取波形数据失败:', error);
        throw error;
    }
}

// ==================== 缺陷记录操作 ====================
/**
 * 创建缺陷记录
 * @param {Object} defectData - 缺陷数据
 * @returns {Promise<Object>} 创建的缺陷记录
 */
async function createDefect(defectData) {
    try {
        const { data, error } = await supabaseClient
            .from('defects')
            .insert([{
                test_record_id: defectData.test_record_id,
                defect_type: defectData.defect_type,
                defect_severity: defectData.defect_severity,
                position_start: defectData.position_start,
                position_end: defectData.position_end,
                depth_estimate: defectData.depth_estimate || null,
                amplitude_peak: defectData.amplitude_peak,
                width: defectData.width || null,
                description: defectData.description || '',
                auto_detected: defectData.auto_detected !== false,
                confirmed: defectData.confirmed || false
            }])
            .select()
            .single();
        
        if (error) throw error;
        Logger.info('缺陷记录创建成功:', data.id);
        return data;
    } catch (error) {
        Logger.error('创建缺陷记录失败:', error);
        throw error;
    }
}

/**
 * 获取测试记录的缺陷列表
 * @param {string} testRecordId - 测试记录ID
 * @returns {Promise<Array>} 缺陷列表
 */
async function getDefects(testRecordId) {
    try {
        const { data, error } = await supabaseClient
            .from('defects')
            .select('*')
            .eq('test_record_id', testRecordId)
            .order('position_start', { ascending: true });
        
        if (error) throw error;
        return data;
    } catch (error) {
        Logger.error('获取缺陷列表失败:', error);
        throw error;
    }
}

/**
 * 更新缺陷记录
 * @param {string} defectId - 缺陷ID
 * @param {Object} updates - 更新数据
 * @returns {Promise<Object>} 更新后的缺陷记录
 */
async function updateDefect(defectId, updates) {
    try {
        const { data, error } = await supabaseClient
            .from('defects')
            .update(updates)
            .eq('id', defectId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        Logger.error('更新缺陷记录失败:', error);
        throw error;
    }
}

// ==================== 测试模板操作 ====================
/**
 * 获取所有测试模板
 * @returns {Promise<Array>} 模板列表
 */
async function getTestTemplates() {
    try {
        const { data, error } = await supabaseClient
            .from('test_templates')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    } catch (error) {
        Logger.error('获取测试模板失败:', error);
        throw error;
    }
}

/**
 * 创建测试模板
 * @param {Object} templateData - 模板数据
 * @returns {Promise<Object>} 创建的模板
 */
async function createTestTemplate(templateData) {
    try {
        const { data, error } = await supabaseClient
            .from('test_templates')
            .insert([{
                template_name: templateData.template_name,
                template_type: templateData.template_type,
                parameters: templateData.parameters,
                description: templateData.description || '',
                is_default: templateData.is_default || false,
                created_by: templateData.created_by || APP_CONFIG.defaultOperator
            }])
            .select()
            .single();
        
        if (error) throw error;
        Logger.info('测试模板创建成功:', data.id);
        return data;
    } catch (error) {
        Logger.error('创建测试模板失败:', error);
        throw error;
    }
}

// ==================== 校准设置操作 ====================
/**
 * 获取当前有效的校准设置
 * @returns {Promise<Object>} 校准设置
 */
async function getActiveCalibration() {
    try {
        const { data, error } = await supabaseClient
            .from('calibration_settings')
            .select('*')
            .eq('is_active', true)
            .gte('valid_until', new Date().toISOString())
            .order('calibration_date', { ascending: false })
            .limit(1)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    } catch (error) {
        Logger.error('获取校准设置失败:', error);
        return null;
    }
}

/**
 * 创建校准设置
 * @param {Object} calibrationData - 校准数据
 * @returns {Promise<Object>} 创建的校准设置
 */
async function createCalibration(calibrationData) {
    try {
        const { data, error } = await supabaseClient
            .from('calibration_settings')
            .insert([{
                calibration_date: calibrationData.calibration_date || new Date().toISOString(),
                standard_block_type: calibrationData.standard_block_type,
                calibration_curve: calibrationData.calibration_curve,
                operator: calibrationData.operator || APP_CONFIG.defaultOperator,
                valid_until: calibrationData.valid_until,
                is_active: calibrationData.is_active !== false,
                notes: calibrationData.notes || ''
            }])
            .select()
            .single();
        
        if (error) throw error;
        Logger.info('校准设置创建成功:', data.id);
        return data;
    } catch (error) {
        Logger.error('创建校准设置失败:', error);
        throw error;
    }
}

// ==================== 报告记录操作 ====================
/**
 * 创建报告记录
 * @param {Object} reportData - 报告数据
 * @returns {Promise<Object>} 创建的报告记录
 */
async function createReport(reportData) {
    try {
        const { data, error } = await supabaseClient
            .from('reports')
            .insert([{
                test_record_id: reportData.test_record_id,
                report_title: reportData.report_title,
                report_type: reportData.report_type,
                generated_date: reportData.generated_date || new Date().toISOString(),
                generated_by: reportData.generated_by || APP_CONFIG.defaultOperator,
                file_url: reportData.file_url || null,
                file_size: reportData.file_size || null
            }])
            .select()
            .single();
        
        if (error) throw error;
        Logger.info('报告记录创建成功:', data.id);
        return data;
    } catch (error) {
        Logger.error('创建报告记录失败:', error);
        throw error;
    }
}

/**
 * 获取报告列表
 * @param {Object} filters - 筛选条件
 * @returns {Promise<Array>} 报告列表
 */
async function getReports(filters = {}) {
    try {
        let query = supabaseClient.from('reports').select('*, test_records(workpiece_id, test_type)');
        
        if (filters.test_record_id) {
            query = query.eq('test_record_id', filters.test_record_id);
        }
        
        query = query.order('generated_date', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data;
    } catch (error) {
        Logger.error('获取报告列表失败:', error);
        throw error;
    }
}

// ==================== 统计查询 ====================
/**
 * 获取测试统计信息
 * @param {Object} filters - 筛选条件
 * @returns {Promise<Object>} 统计信息
 */
async function getTestStatistics(filters = {}) {
    try {
        let query = supabaseClient.from('test_records').select('test_result, defect_count');
        
        if (filters.date_from) {
            query = query.gte('test_date', filters.date_from);
        }
        if (filters.date_to) {
            query = query.lte('test_date', filters.date_to);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // 计算统计信息
        const stats = {
            total: data.length,
            pass: data.filter(r => r.test_result === 'pass').length,
            fail: data.filter(r => r.test_result === 'fail').length,
            pending: data.filter(r => r.test_result === 'pending').length,
            totalDefects: data.reduce((sum, r) => sum + r.defect_count, 0),
            avgDefects: data.length > 0 ? (data.reduce((sum, r) => sum + r.defect_count, 0) / data.length).toFixed(2) : 0
        };
        
        return stats;
    } catch (error) {
        Logger.error('获取统计信息失败:', error);
        throw error;
    }
}

// ==================== 导出所有函数 ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDatabase,
        createTestRecord,
        getTestRecords,
        getTestRecord,
        updateTestRecord,
        deleteTestRecord,
        saveWaveformData,
        getWaveformData,
        createDefect,
        getDefects,
        updateDefect,
        getTestTemplates,
        createTestTemplate,
        getActiveCalibration,
        createCalibration,
        createReport,
        getReports,
        getTestStatistics
    };
}
