// 检查远程数据库的实际表结构
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zzyueuweeoakopuuwfau.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTables() {
    console.log('🔍 检查远程数据库表结构...\n');
    
    const tables = ['test_records', 'waveform_data', 'defects', 'calibration_settings', 'test_templates', 'reports'];
    
    for (const tableName of tables) {
        try {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);
            
            if (error) {
                console.log(`❌ ${tableName}: ${error.message}`);
            } else {
                console.log(`✅ ${tableName}: 表存在 (可访问)`);
            }
        } catch (err) {
            console.log(`⚠️ ${tableName}: ${err.message}`);
        }
    }
    
    console.log('\n建议：使用 Supabase 控制台直接执行 SQL 脚本');
}

checkTables();
