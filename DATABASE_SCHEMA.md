# 数据库设计文档

## 概述

本文档定义磁检测仪器网页版的Supabase PostgreSQL数据库结构。包含6个核心数据表，用于存储测试记录、波形数据、缺陷信息、校准参数、测试模板和报告记录。

## 数据库初始化SQL脚本

在Supabase SQL Editor中执行以下脚本创建所有表结构：

```sql
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
CREATE INDEX idx_test_records_date ON test_records(test_date DESC);
CREATE INDEX idx_test_records_workpiece ON test_records(workpiece_id);
CREATE INDEX idx_test_records_result ON test_records(test_result);
CREATE INDEX idx_test_records_operator ON test_records(operator);

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
CREATE INDEX idx_waveform_test_id ON waveform_data(test_record_id);
CREATE INDEX idx_waveform_position ON waveform_data(position);

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
CREATE INDEX idx_defects_test_id ON defects(test_record_id);
CREATE INDEX idx_defects_type ON defects(defect_type);
CREATE INDEX idx_defects_severity ON defects(defect_severity);

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
CREATE INDEX idx_calibration_active ON calibration_settings(is_active, valid_until);
CREATE INDEX idx_calibration_date ON calibration_settings(calibration_date DESC);

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
CREATE INDEX idx_templates_type ON test_templates(template_type);
CREATE INDEX idx_templates_default ON test_templates(is_default);

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
CREATE INDEX idx_reports_test_id ON reports(test_record_id);
CREATE INDEX idx_reports_date ON reports(generated_date DESC);

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
);

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
-- 启用行级安全策略（RLS）- 可选
-- 注意：单用户模式可以暂时禁用RLS，多用户时需要启用

-- ALTER TABLE test_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE waveform_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE defects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE calibration_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE test_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（单用户模式）
-- CREATE POLICY "Allow all operations" ON test_records FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON waveform_data FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON defects FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON calibration_settings FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON test_templates FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON reports FOR ALL USING (true);

-- ============================================
-- 数据库初始化完成
-- ============================================
```

## 表结构详细说明

### 1. test_records - 测试记录主表

存储每次磁检测的基本信息和测试参数。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | 主键 | 唯一标识 |
| test_date | TIMESTAMP | NOT NULL | 测试日期时间 |
| workpiece_id | VARCHAR(50) | NOT NULL | 工件编号 |
| workpiece_material | VARCHAR(50) | NOT NULL | 材质（如：Q235） |
| workpiece_spec | VARCHAR(100) | - | 规格（如：Φ219×6mm） |
| test_type | VARCHAR(50) | NOT NULL | 测试类型 |
| operator | VARCHAR(50) | NOT NULL | 操作员 |
| sampling_rate | INTEGER | NOT NULL | 采样频率（Hz） |
| sensitivity | INTEGER | 1-10 | 灵敏度等级 |
| upper_gate | FLOAT | 0-100 | 上门限（%） |
| lower_gate | FLOAT | 0-100 | 下门限（%） |
| defect_count | INTEGER | NOT NULL | 缺陷数量 |
| test_result | VARCHAR(20) | pass/fail/pending | 测试结果 |
| notes | TEXT | - | 备注 |
| created_at | TIMESTAMP | 自动 | 创建时间 |
| updated_at | TIMESTAMP | 自动 | 更新时间 |

### 2. waveform_data - 波形数据表

存储完整的波形采样数据。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | 主键 | 唯一标识 |
| test_record_id | UUID | 外键 | 关联测试记录 |
| position | FLOAT | NOT NULL | 检测位置（mm） |
| timestamp_ms | FLOAT | NOT NULL | 时间戳（ms） |
| amplitude | FLOAT | NOT NULL | 幅值 |
| data_points | JSONB | NOT NULL | 完整波形数据数组 |
| scan_type | VARCHAR(20) | A/B/C-SCAN | 扫描类型 |
| created_at | TIMESTAMP | 自动 | 创建时间 |

**data_points JSON结构示例：**
```json
{
  "points": [
    {"x": 0, "y": 45.2},
    {"x": 0.1, "y": 46.8},
    {"x": 0.2, "y": 48.3}
  ],
  "length": 10000,
  "unit": "mm"
}
```

### 3. defects - 缺陷记录表

存储检测到的所有缺陷信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | 主键 | 唯一标识 |
| test_record_id | UUID | 外键 | 关联测试记录 |
| defect_type | VARCHAR(50) | NOT NULL | 缺陷类型 |
| defect_severity | VARCHAR(20) | minor/moderate/severe | 严重程度 |
| position_start | FLOAT | NOT NULL | 起始位置（mm） |
| position_end | FLOAT | NOT NULL | 结束位置（mm） |
| depth_estimate | FLOAT | - | 估计深度（mm） |
| amplitude_peak | FLOAT | NOT NULL | 峰值幅值 |
| width | FLOAT | - | 缺陷宽度（mm） |
| description | TEXT | - | 描述 |
| auto_detected | BOOLEAN | 默认true | 是否自动检测 |
| confirmed | BOOLEAN | 默认false | 是否人工确认 |
| created_at | TIMESTAMP | 自动 | 创建时间 |

**缺陷类型枚举：**
- 表面裂纹 (surface_crack)
- 内部裂纹 (internal_crack)
- 气孔 (porosity)
- 夹杂 (inclusion)
- 折叠 (fold)
- 重皮 (overlap)

### 4. calibration_settings - 校准设置表

存储设备校准参数和校准曲线。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | 主键 | 唯一标识 |
| calibration_date | TIMESTAMP | NOT NULL | 校准日期 |
| standard_block_type | VARCHAR(50) | NOT NULL | 标准试块类型 |
| calibration_curve | JSONB | NOT NULL | 校准曲线数据 |
| operator | VARCHAR(50) | NOT NULL | 操作员 |
| valid_until | TIMESTAMP | NOT NULL | 有效期至 |
| is_active | BOOLEAN | 默认true | 是否启用 |
| notes | TEXT | - | 备注 |
| created_at | TIMESTAMP | 自动 | 创建时间 |

**calibration_curve JSON结构示例：**
```json
{
  "curve_type": "DAC",
  "points": [
    {"distance": 10, "amplitude": 95},
    {"distance": 20, "amplitude": 85}
  ],
  "material": "Q235",
  "frequency": 5000
}
```

### 5. test_templates - 测试模板表

存储预设的测试参数组合。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | 主键 | 唯一标识 |
| template_name | VARCHAR(100) | UNIQUE | 模板名称 |
| template_type | VARCHAR(50) | NOT NULL | 模板类型 |
| parameters | JSONB | NOT NULL | 参数配置 |
| description | TEXT | - | 描述 |
| is_default | BOOLEAN | 默认false | 是否默认 |
| created_by | VARCHAR(50) | NOT NULL | 创建者 |
| created_at | TIMESTAMP | 自动 | 创建时间 |
| updated_at | TIMESTAMP | 自动 | 更新时间 |

**parameters JSON结构示例：**
```json
{
  "sampling_rate": 2000,
  "sensitivity": 7,
  "upper_gate": 80.0,
  "lower_gate": 20.0,
  "scan_type": "B-SCAN",
  "display_mode": "grayscale",
  "noise_suppression": true
}
```

### 6. reports - 报告记录表

存储生成的检测报告信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | 主键 | 唯一标识 |
| test_record_id | UUID | 外键 | 关联测试记录 |
| report_title | VARCHAR(200) | NOT NULL | 报告标题 |
| report_type | VARCHAR(50) | NOT NULL | 报告类型 |
| generated_date | TIMESTAMP | NOT NULL | 生成日期 |
| generated_by | VARCHAR(50) | NOT NULL | 生成者 |
| file_url | TEXT | - | PDF文件URL |
| file_size | INTEGER | - | 文件大小（bytes） |
| created_at | TIMESTAMP | 自动 | 创建时间 |

## 数据关系图

```
test_records (1) ──< (N) waveform_data
      │
      ├──< (N) defects
      │
      └──< (N) reports

calibration_settings (独立表)
test_templates (独立表)
```

## 性能优化

### 索引策略
- 为常用查询字段创建索引（日期、工件编号、测试结果等）
- 外键自动创建索引
- JSONB字段可以使用GIN索引（如需要）

### 分区策略（可选）
对于大数据量，可以按月份对test_records表进行分区：
```sql
-- 按月份分区示例（未来扩展）
CREATE TABLE test_records_2025_10 PARTITION OF test_records
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
```

## 数据备份

Supabase自动提供：
- 每日自动备份
- Point-in-time恢复（Pro计划）
- 手动备份导出

## 安全性

### 行级安全策略（RLS）
当前版本为单用户模式，RLS策略已注释。
多用户版本需要启用并配置详细的访问控制策略。

### 数据加密
- 传输加密：HTTPS/TLS
- 存储加密：Supabase默认加密

---

**文档版本**：v1.0  
**创建日期**：2025-10-06  
**最后更新**：2025-10-06
