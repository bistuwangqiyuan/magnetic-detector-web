# Supabase数据库设置指南

## 📋 概述

本指南将帮助您在Supabase控制台中快速创建磁检测仪器所需的所有数据库表。

## 🚀 快速开始（5分钟）

### 步骤1: 登录Supabase控制台

1. 打开浏览器，访问: **https://supabase.com/dashboard**
2. 登录您的Supabase账号
3. 选择项目: `zzyueuweeoakopuuwfau`

或者直接访问: **https://supabase.com/dashboard/project/zzyueuweeoakopuuwfau**

### 步骤2: 打开SQL Editor

1. 在左侧菜单中，点击 **"SQL Editor"** 图标 (看起来像 `</>`)
2. 点击右上角的 **"+ New Query"** 按钮
3. 将会打开一个空白的SQL编辑器

### 步骤3: 执行数据库创建脚本

#### 方法A: 一次性创建所有表（推荐） ✅

将以下完整SQL脚本复制并粘贴到SQL Editor中，然后点击右下角的 **"RUN"** 按钮：

```sql
-- ============================================
-- 磁检测仪器数据库完整初始化脚本
-- 执行时间: ~3秒
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

CREATE INDEX IF NOT EXISTS idx_test_records_date ON test_records(test_date DESC);
CREATE INDEX IF NOT EXISTS idx_test_records_workpiece ON test_records(workpiece_id);
CREATE INDEX IF NOT EXISTS idx_test_records_result ON test_records(test_result);
CREATE INDEX IF NOT EXISTS idx_test_records_operator ON test_records(operator);

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

CREATE INDEX IF NOT EXISTS idx_waveform_test_id ON waveform_data(test_record_id);
CREATE INDEX IF NOT EXISTS idx_waveform_position ON waveform_data(position);

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

CREATE INDEX IF NOT EXISTS idx_defects_test_id ON defects(test_record_id);
CREATE INDEX IF NOT EXISTS idx_defects_type ON defects(defect_type);
CREATE INDEX IF NOT EXISTS idx_defects_severity ON defects(defect_severity);

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

CREATE INDEX IF NOT EXISTS idx_calibration_active ON calibration_settings(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_calibration_date ON calibration_settings(calibration_date DESC);

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

CREATE INDEX IF NOT EXISTS idx_templates_type ON test_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_templates_default ON test_templates(is_default);

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

CREATE INDEX IF NOT EXISTS idx_reports_test_id ON reports(test_record_id);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(generated_date DESC);

-- 插入默认测试模板
INSERT INTO test_templates (template_name, template_type, parameters, description, is_default, created_by) VALUES
('钢管标准检测', '钢管检测', '{"sampling_rate": 2000, "sensitivity": 7, "upper_gate": 80.0, "lower_gate": 20.0, "scan_type": "B-SCAN", "noise_suppression": true}'::jsonb, '适用于无缝钢管和焊接钢管的标准磁检测', true, 'system'),
('钢板焊缝检测', '焊缝检测', '{"sampling_rate": 5000, "sensitivity": 8, "upper_gate": 75.0, "lower_gate": 25.0, "scan_type": "A-SCAN", "noise_suppression": true}'::jsonb, '适用于钢板焊缝的高灵敏度检测', false, 'system'),
('高灵敏度检测', '精密检测', '{"sampling_rate": 10000, "sensitivity": 10, "upper_gate": 70.0, "lower_gate": 30.0, "scan_type": "B-SCAN", "noise_suppression": false}'::jsonb, '适用于要求极高的精密检测场景', false, 'system')
ON CONFLICT (template_name) DO NOTHING;

-- 验证表创建
SELECT 'Tables created successfully!' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('test_records', 'waveform_data', 'defects', 'calibration_settings', 'test_templates', 'reports');
```

#### 方法B: 分步创建（如果方法A失败）

如果一次性脚本执行失败，可以分别执行以下6个表的创建语句。请在DATABASE_SCHEMA.md文件中查看详细的SQL语句。

### 步骤4: 验证创建结果

执行成功后，您应该看到:
- ✅ Success消息
- ✅ 6个表名列表: test_records, waveform_data, defects, calibration_settings, test_templates, reports

### 步骤5: 查看创建的表

1. 点击左侧菜单的 **"Table Editor"** 图标
2. 您应该能看到所有6个新创建的表
3. 点击任意表可以查看表结构和数据

### 步骤6: 设置RLS策略（可选，推荐）

对于生产环境，建议启用行级安全策略(RLS)：

```sql
-- 启用RLS
ALTER TABLE test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE waveform_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（开发环境）
CREATE POLICY "Allow all" ON test_records FOR ALL USING (true);
CREATE POLICY "Allow all" ON waveform_data FOR ALL USING (true);
CREATE POLICY "Allow all" ON defects FOR ALL USING (true);
CREATE POLICY "Allow all" ON calibration_settings FOR ALL USING (true);
CREATE POLICY "Allow all" ON test_templates FOR ALL USING (true);
CREATE POLICY "Allow all" ON reports FOR ALL USING (true);
```

## ✅ 完成！

数据库设置完成后，您可以：
1. 返回项目根目录
2. 在浏览器中打开 `index.html`
3. 开始使用磁检测仪器！

## 🔍 故障排除

### 问题1: "permission denied" 错误
**解决方案**: 确保您是项目的所有者或管理员

### 问题2: "relation already exists" 错误
**解决方案**: 表已经存在，可以安全忽略。或者先删除表后重新创建：
```sql
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS test_templates CASCADE;
DROP TABLE IF EXISTS calibration_settings CASCADE;
DROP TABLE IF EXISTS defects CASCADE;
DROP TABLE IF EXISTS waveform_data CASCADE;
DROP TABLE IF NOT EXISTS test_records CASCADE;
```

### 问题3: 无法插入数据
**解决方案**: 检查RLS策略是否正确设置，或临时禁用RLS进行测试

## 📚 更多信息

- [Supabase官方文档](https://supabase.com/docs)
- [PostgreSQL数据类型](https://www.postgresql.org/docs/current/datatype.html)
- [完整数据库设计文档](./DATABASE_SCHEMA.md)

---

**预计完成时间**: 5分钟  
**难度等级**: ⭐☆☆☆☆ 简单
