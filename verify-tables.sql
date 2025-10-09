-- 验证所有表是否存在
SELECT 
    tablename as "表名",
    schemaname as "架构"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'test_records',
        'waveform_data', 
        'defects',
        'calibration_settings',
        'test_templates',
        'reports'
    )
ORDER BY tablename;

-- 检查测试模板数量
SELECT 
    '测试模板数量' as "统计项",
    COUNT(*) as "数量"
FROM test_templates;

-- 检查校准设置数量
SELECT 
    '校准设置数量' as "统计项",
    COUNT(*) as "数量"
FROM calibration_settings;
