-- ============================================
-- 磁检测仪器数据库初始化脚本
-- ============================================

-- 1. 测试记录主表
CREATE TABLE IF NOT EXISTS test_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    workpiece_id VARCHAR(50) NOT NULL,
    workpiece_material VARCHAR(50) NOT NULL,
    workpiece_spec VARCHAR(100),
    test_type VARCHAR(50) NOT NULL,
    operator VARCHAR(50) NOT NULL,
    sampling_rate INTEGER NOT NULL DEFAULT 1000,
    sensitivity INTEGER NOT NULL DEFAULT 5 CHECK (sensitivity >= 1 AND sensitivity <= 10),
    upper_gate FLOAT NOT NULL DEFAULT 80.0 CHECK (upper_gate >= 0 AND upper_gate <= 100),
    lower_gate FLOAT NOT NULL DEFAULT 20.0 CHECK (lower_gate >= 0 AND lower_gate <= 100),
    defect_count INTEGER NOT NULL DEFAULT 0,
    test_result VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (test_result IN ('pass', 'fail', 'pending')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_test_records_date ON test_records(test_date DESC);
CREATE INDEX IF NOT EXISTS idx_test_records_workpiece ON test_records(workpiece_id);
CREATE INDEX IF NOT EXISTS idx_test_records_result ON test_records(test_result);
CREATE INDEX IF NOT EXISTS idx_test_records_operator ON test_records(operator);

-- 添加注释
COMMENT ON TABLE test_records IS '测试记录主表，存储每次磁检测的基本信息';
COMMENT ON COLUMN test_records.test_date IS '测试日期时间';
COMMENT ON COLUMN test_records.workpiece_id IS '工件编号';
COMMENT ON COLUMN test_records.workpiece_material IS '工件材质（如：Q235、20#钢等）';
COMMENT ON COLUMN test_records.workpiece_spec IS '工件规格（如：Φ219×6mm）';
COMMENT ON COLUMN test_records.test_type IS '测试类型（如：钢管检测、焊缝检测等）';
COMMENT ON COLUMN test_records.sampling_rate IS '采样频率（Hz）';
COMMENT ON COLUMN test_records.sensitivity IS '灵敏度等级（1-10）';
COMMENT ON COLUMN test_records.upper_gate IS '上门限值（%）';
COMMENT ON COLUMN test_records.lower_gate IS '下门限值（%）';

-- ============================================
-- 2. 波形数据表
CREATE TABLE IF NOT EXISTS waveform_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_record_id UUID NOT NULL REFERENCES test_records(id) ON DELETE CASCADE,
    position FLOAT NOT NULL DEFAULT 0,
    timestamp_ms FLOAT NOT NULL DEFAULT 0,
    amplitude FLOAT NOT NULL,
    data_points JSONB NOT NULL,
    scan_type VARCHAR(20) NOT NULL DEFAULT 'B-SCAN' CHECK (scan_type IN ('A-SCAN', 'B-SCAN', 'C-SCAN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_waveform_test_id ON waveform_data(test_record_id);
CREATE INDEX IF NOT EXISTS idx_waveform_position ON waveform_data(position);

-- 添加注释
COMMENT ON TABLE waveform_data IS '波形数据表，存储完整的波形采样数据';
COMMENT ON COLUMN waveform_data.position IS '检测位置（mm）';
COMMENT ON COLUMN waveform_data.timestamp_ms IS '时间戳（ms）';
COMMENT ON COLUMN waveform_data.amplitude IS '幅值';
COMMENT ON COLUMN waveform_data.data_points IS 'JSON格式的完整波形数据数组';

-- ============================================
-- 3. 缺陷记录表
CREATE TABLE IF NOT EXISTS defects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_record_id UUID NOT NULL REFERENCES test_records(id) ON DELETE CASCADE,
    defect_type VARCHAR(50) NOT NULL,
    defect_severity VARCHAR(20) NOT NULL CHECK (defect_severity IN ('minor', 'moderate', 'severe')),
    position_start FLOAT NOT NULL,
    position_end FLOAT NOT NULL,
    depth_estimate FLOAT,
    amplitude_peak FLOAT NOT NULL,
    width FLOAT,
    description TEXT,
    auto_detected BOOLEAN DEFAULT TRUE,
    confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_defects_test_id ON defects(test_record_id);
CREATE INDEX IF NOT EXISTS idx_defects_type ON defects(defect_type);
CREATE INDEX IF NOT EXISTS idx_defects_severity ON defects(defect_severity);

-- 添加注释
COMMENT ON TABLE defects IS '缺陷记录表，存储检测到的所有缺陷信息';
COMMENT ON COLUMN defects.defect_type IS '缺陷类型（如：表面裂纹、内部裂纹、气孔、夹杂等）';
COMMENT ON COLUMN defects.defect_severity IS '严重程度（minor-轻微、moderate-中等、severe-严重）';
COMMENT ON COLUMN defects.position_start IS '缺陷起始位置（mm）';
COMMENT ON COLUMN defects.position_end IS '缺陷结束位置（mm）';
COMMENT ON COLUMN defects.depth_estimate IS '估计深度（mm）';
COMMENT ON COLUMN defects.amplitude_peak IS '峰值幅值';
COMMENT ON COLUMN defects.width IS '缺陷宽度（mm）';
COMMENT ON COLUMN defects.auto_detected IS '是否自动检测';
COMMENT ON COLUMN defects.confirmed IS '是否已人工确认';

-- ============================================
-- 4. 校准设置表
CREATE TABLE IF NOT EXISTS calibration_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calibration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    standard_block_type VARCHAR(50) NOT NULL,
    calibration_curve JSONB NOT NULL,
    operator VARCHAR(50) NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_calibration_active ON calibration_settings(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_calibration_date ON calibration_settings(calibration_date DESC);

-- 添加注释
COMMENT ON TABLE calibration_settings IS '校准设置表，存储设备校准参数';
COMMENT ON COLUMN calibration_settings.standard_block_type IS '标准试块类型（如：平底孔试块、槽型试块等）';
COMMENT ON COLUMN calibration_settings.calibration_curve IS 'JSON格式的校准曲线数据（DAC/AVG曲线）';
COMMENT ON COLUMN calibration_settings.valid_until IS '校准有效期至';
COMMENT ON COLUMN calibration_settings.is_active IS '是否当前启用';

-- ============================================
-- 5. 测试模板表
CREATE TABLE IF NOT EXISTS test_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) NOT NULL UNIQUE,
    template_type VARCHAR(50) NOT NULL,
    parameters JSONB NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_templates_type ON test_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_templates_default ON test_templates(is_default);

-- 添加注释
COMMENT ON TABLE test_templates IS '测试模板表，存储预设的测试参数组合';
COMMENT ON COLUMN test_templates.template_name IS '模板名称';
COMMENT ON COLUMN test_templates.template_type IS '模板类型（如：钢管检测、钢板检测、焊缝检测）';
COMMENT ON COLUMN test_templates.parameters IS 'JSON格式的参数配置';
COMMENT ON COLUMN test_templates.is_default IS '是否默认模板';

-- ============================================
-- 6. 报告记录表
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_record_id UUID NOT NULL REFERENCES test_records(id) ON DELETE CASCADE,
    report_title VARCHAR(200) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    generated_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    generated_by VARCHAR(50) NOT NULL,
    file_url TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reports_test_id ON reports(test_record_id);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(generated_date DESC);

-- 添加注释
COMMENT ON TABLE reports IS '报告记录表，存储生成的检测报告信息';
COMMENT ON COLUMN reports.report_title IS '报告标题';
COMMENT ON COLUMN reports.report_type IS '报告类型（如：标准报告、简化报告等）';
COMMENT ON COLUMN reports.file_url IS 'PDF文件URL（Supabase Storage）';
COMMENT ON COLUMN reports.file_size IS '文件大小（bytes）';

-- ============================================
-- 插入默认测试模板数据
INSERT INTO test_templates (template_name, template_type, parameters, description, is_default, created_by) VALUES
(
    '钢管标准检测',
    '钢管检测',
    '{
        "sampling_rate": 2000,
        "sensitivity": 7,
        "upper_gate": 80.0,
        "lower_gate": 20.0,
        "scan_type": "B-SCAN",
        "display_mode": "grayscale",
        "noise_suppression": true
    }'::jsonb,
    '适用于无缝钢管和焊接钢管的标准磁检测',
    true,
    'system'
),
(
    '钢板焊缝检测',
    '焊缝检测',
    '{
        "sampling_rate": 5000,
        "sensitivity": 8,
        "upper_gate": 75.0,
        "lower_gate": 25.0,
        "scan_type": "A-SCAN",
        "display_mode": "waveform",
        "noise_suppression": true
    }'::jsonb,
    '适用于钢板焊缝质量检测',
    false,
    'system'
),
(
    '高灵敏度检测',
    '精密检测',
    '{
        "sampling_rate": 10000,
        "sensitivity": 10,
        "upper_gate": 70.0,
        "lower_gate": 30.0,
        "scan_type": "B-SCAN",
        "display_mode": "color",
        "noise_suppression": false
    }'::jsonb,
    '用于小缺陷的高灵敏度检测',
    false,
    'system'
)
ON CONFLICT (template_name) DO NOTHING;

-- ============================================
-- 插入默认校准数据
INSERT INTO calibration_settings (
    calibration_date,
    standard_block_type,
    calibration_curve,
    operator,
    valid_until,
    is_active,
    notes
) VALUES (
    NOW(),
    '平底孔标准试块Φ3mm',
    '{
        "curve_type": "DAC",
        "points": [
            {"distance": 10, "amplitude": 95},
            {"distance": 20, "amplitude": 85},
            {"distance": 30, "amplitude": 75},
            {"distance": 40, "amplitude": 65},
            {"distance": 50, "amplitude": 55}
        ],
        "material": "Q235",
        "frequency": 5000
    }'::jsonb,
    'system',
    NOW() + INTERVAL '1 year',
    true,
    '系统默认校准曲线，基于平底孔标准试块'
);

-- ============================================
-- 创建自动更新updated_at的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为test_records表创建触发器
CREATE TRIGGER update_test_records_updated_at BEFORE UPDATE ON test_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为test_templates表创建触发器
CREATE TRIGGER update_test_templates_updated_at BEFORE UPDATE ON test_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 启用行级安全策略（RLS）
ALTER TABLE test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE waveform_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（开发环境）
CREATE POLICY "Allow all operations" ON test_records FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON waveform_data FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON defects FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON calibration_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON test_templates FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON reports FOR ALL USING (true);

-- ============================================
-- 数据库初始化完成
-- ============================================
