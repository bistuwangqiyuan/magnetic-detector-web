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
