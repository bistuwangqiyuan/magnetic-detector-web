// 直接通过 Supabase 客户端设置数据库
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zzyueuweeoakopuuwfau.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setupDatabase() {
    console.log('🔧 开始设置数据库...\n');
    
    // 插入默认测试模板
    console.log('📝 插入默认测试模板...');
    const templates = [
        {
            template_name: '钢管标准检测',
            template_type: '钢管检测',
            parameters: {
                sampling_rate: 2000,
                sensitivity: 7,
                upper_gate: 80.0,
                lower_gate: 20.0,
                scan_type: 'B-SCAN',
                display_mode: 'grayscale',
                noise_suppression: true
            },
            description: '适用于无缝钢管和焊接钢管的标准磁检测',
            is_default: true,
            created_by: 'system'
        },
        {
            template_name: '钢板焊缝检测',
            template_type: '焊缝检测',
            parameters: {
                sampling_rate: 5000,
                sensitivity: 8,
                upper_gate: 75.0,
                lower_gate: 25.0,
                scan_type: 'A-SCAN',
                display_mode: 'waveform',
                noise_suppression: true
            },
            description: '适用于钢板焊缝质量检测',
            is_default: false,
            created_by: 'system'
        },
        {
            template_name: '高灵敏度检测',
            template_type: '精密检测',
            parameters: {
                sampling_rate: 10000,
                sensitivity: 10,
                upper_gate: 70.0,
                lower_gate: 30.0,
                scan_type: 'B-SCAN',
                display_mode: 'color',
                noise_suppression: false
            },
            description: '用于小缺陷的高灵敏度检测',
            is_default: false,
            created_by: 'system'
        }
    ];
    
    for (const template of templates) {
        const { data, error } = await supabase
            .from('test_templates')
            .upsert(template, { onConflict: 'template_name' });
        
        if (error) {
            console.log(`   ❌ ${template.template_name}: ${error.message}`);
        } else {
            console.log(`   ✅ ${template.template_name}`);
        }
    }
    
    // 插入默认校准设置
    console.log('\n🔬 插入默认校准设置...');
    const calibration = {
        calibration_date: new Date().toISOString(),
        standard_block_type: '平底孔标准试块Φ3mm',
        calibration_curve: {
            curve_type: 'DAC',
            points: [
                { distance: 10, amplitude: 95 },
                { distance: 20, amplitude: 85 },
                { distance: 30, amplitude: 75 },
                { distance: 40, amplitude: 65 },
                { distance: 50, amplitude: 55 }
            ],
            material: 'Q235',
            frequency: 5000
        },
        operator: 'system',
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        notes: '系统默认校准曲线，基于平底孔标准试块'
    };
    
    const { data: calData, error: calError } = await supabase
        .from('calibration_settings')
        .insert(calibration);
    
    if (calError) {
        console.log(`   ❌ 校准设置: ${calError.message}`);
    } else {
        console.log(`   ✅ 校准设置已添加`);
    }
    
    console.log('\n✅ 数据库设置完成！');
    console.log('🚀 现在运行验证脚本: node verify-database.js');
}

setupDatabase().catch(error => {
    console.error('❌ 设置失败:', error.message);
    process.exit(1);
});
