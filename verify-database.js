// Supabase 数据库验证脚本
const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const SUPABASE_URL = 'https://zzyueuweeoakopuuwfau.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const expectedTables = [
    { name: 'test_records', description: '测试记录主表' },
    { name: 'waveform_data', description: '波形数据表' },
    { name: 'defects', description: '缺陷记录表' },
    { name: 'calibration_settings', description: '校准设置表' },
    { name: 'test_templates', description: '测试模板表' },
    { name: 'reports', description: '报告记录表' }
];

async function verifyDatabase() {
    console.log('🔍 开始验证 Supabase 数据库...\n');
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const table of expectedTables) {
        try {
            const { data, error, count } = await supabase
                .from(table.name)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.log(`❌ ${table.name} (${table.description}): 失败`);
                console.log(`   错误: ${error.message}\n`);
                results.push({ ...table, status: 'error', error: error.message });
                errorCount++;
            } else {
                console.log(`✅ ${table.name} (${table.description}): 成功`);
                console.log(`   记录数: ${count || 0}\n`);
                results.push({ ...table, status: 'success', count: count || 0 });
                successCount++;
            }
        } catch (err) {
            console.log(`❌ ${table.name} (${table.description}): 异常`);
            console.log(`   错误: ${err.message}\n`);
            results.push({ ...table, status: 'error', error: err.message });
            errorCount++;
        }
    }

    // 检查默认数据
    if (errorCount === 0) {
        console.log('📊 检查默认数据...\n');
        
        try {
            const { data: templates, error: templatesError } = await supabase
                .from('test_templates')
                .select('template_name, template_type');
            
            if (!templatesError && templates) {
                console.log(`✅ 测试模板: ${templates.length} 个`);
                templates.forEach(t => {
                    console.log(`   - ${t.template_name} (${t.template_type})`);
                });
                console.log('');
            }
        } catch (err) {
            console.log(`⚠️ 无法读取测试模板: ${err.message}\n`);
        }

        try {
            const { data: calibration, error: calibrationError } = await supabase
                .from('calibration_settings')
                .select('standard_block_type, is_active');
            
            if (!calibrationError && calibration) {
                console.log(`✅ 校准设置: ${calibration.length} 个`);
                calibration.forEach(c => {
                    console.log(`   - ${c.standard_block_type} (${c.is_active ? '启用' : '禁用'})`);
                });
                console.log('');
            }
        } catch (err) {
            console.log(`⚠️ 无法读取校准设置: ${err.message}\n`);
        }
    }

    // 输出总结
    console.log('='.repeat(60));
    console.log('📋 验证总结\n');
    console.log(`✅ 成功: ${successCount} 个表`);
    console.log(`❌ 失败: ${errorCount} 个表`);
    console.log('='.repeat(60));
    
    if (errorCount === 0) {
        console.log('\n🎉 恭喜！数据库设置完成，所有表已成功创建！');
        console.log('📌 下一步: 在浏览器中打开 index.html 开始使用应用');
        process.exit(0);
    } else {
        console.log('\n⚠️ 数据库验证未完全通过，请检查错误信息');
        process.exit(1);
    }
}

// 执行验证
verifyDatabase().catch(error => {
    console.error('❌ 验证过程出错:', error.message);
    process.exit(1);
});
