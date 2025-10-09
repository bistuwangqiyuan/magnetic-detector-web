/**
 * 测试实际部署的网站
 */

const https = require('https');

const baseUrl = 'https://magnetic-detector-web.netlify.app';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function testUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                    success: res.statusCode === 200
                });
            });
        }).on('error', (err) => {
            resolve({
                statusCode: 0,
                error: err.message,
                success: false
            });
        });
    });
}

async function runTests() {
    log('\n========================================', 'cyan');
    log('   测试部署的网站', 'cyan');
    log('========================================\n', 'cyan');
    log(`测试URL: ${baseUrl}\n`, 'yellow');

    let passed = 0;
    let failed = 0;

    // 测试主页
    log('📄 测试页面访问...', 'yellow');
    
    const pages = [
        { name: '主页', path: '/' },
        { name: '历史数据', path: '/pages/history.html' },
        { name: '数据分析', path: '/pages/analysis.html' },
        { name: '报告管理', path: '/pages/reports.html' },
        { name: '参数设置', path: '/pages/settings.html' },
        { name: '校准管理', path: '/pages/calibration.html' },
        { name: '测试页面', path: '/test-deployment.html' }
    ];

    for (const page of pages) {
        const result = await testUrl(baseUrl + page.path);
        if (result.success) {
            log(`  ✅ ${page.name} - 状态码: ${result.statusCode}`, 'green');
            passed++;
            
            // 检查关键内容
            if (page.path === '/pages/analysis.html' && result.body) {
                const hasSupabase = result.body.includes('supabase-js');
                const hasDatabase = result.body.includes('database.js');
                const hasAnalysis = result.body.includes('analysis.js');
                
                if (hasSupabase && hasDatabase && hasAnalysis) {
                    log(`     ✅ 所有依赖已正确加载`, 'green');
                } else {
                    log(`     ⚠️ 依赖检查: Supabase=${hasSupabase}, Database=${hasDatabase}, Analysis=${hasAnalysis}`, 'yellow');
                }
            }
            
            if (page.path === '/pages/settings.html' && result.body) {
                const hasSupabase = result.body.includes('supabase-js');
                const hasDatabase = result.body.includes('database.js');
                
                if (hasSupabase && hasDatabase) {
                    log(`     ✅ 所有依赖已正确加载`, 'green');
                } else {
                    log(`     ⚠️ 依赖检查: Supabase=${hasSupabase}, Database=${hasDatabase}`, 'yellow');
                }
            }
        } else {
            log(`  ❌ ${page.name} - 状态码: ${result.statusCode} - ${result.error || '失败'}`, 'red');
            failed++;
        }
    }

    // 测试静态资源
    log('\n📦 测试静态资源...', 'yellow');
    
    const resources = [
        { name: 'config.js', path: '/js/config.js' },
        { name: 'database.js', path: '/js/database.js' },
        { name: 'main.css', path: '/css/main.css' }
    ];

    for (const resource of resources) {
        const result = await testUrl(baseUrl + resource.path);
        if (result.success) {
            log(`  ✅ ${resource.name} - 可访问`, 'green');
            passed++;
        } else {
            log(`  ❌ ${resource.name} - 状态码: ${result.statusCode}`, 'red');
            failed++;
        }
    }

    // 输出总结
    log('\n========================================', 'cyan');
    log('   测试总结', 'cyan');
    log('========================================', 'cyan');
    log(`总测试数: ${passed + failed}`);
    log(`通过: ${passed}`, 'green');
    log(`失败: ${failed}`, failed > 0 ? 'red' : 'green');
    
    if (failed === 0) {
        log('\n✅ 所有测试通过！网站运行正常！', 'green');
        log(`\n🌐 访问网站: ${baseUrl}`, 'cyan');
        log(`🧪 运行自动化测试: ${baseUrl}/test-deployment.html`, 'cyan');
        return true;
    } else {
        log(`\n⚠️ 有 ${failed} 个测试失败`, 'yellow');
        return false;
    }
}

// 运行测试
runTests().then(result => {
    process.exit(result ? 0 : 1);
});
