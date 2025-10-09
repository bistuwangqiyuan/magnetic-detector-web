// 测试首页部署和显示
const https = require('https');

const siteUrl = 'https://magnetic-detector-web.netlify.app';

console.log('🧪 开始测试首页部署...\n');

function testEndpoint(url, testName) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ ${testName}: 成功 (${res.statusCode})`);
                    resolve({ success: true, data, statusCode: res.statusCode });
                } else {
                    console.log(`❌ ${testName}: 失败 (${res.statusCode})`);
                    resolve({ success: false, statusCode: res.statusCode });
                }
            });
        }).on('error', (err) => {
            console.log(`❌ ${testName}: 错误 - ${err.message}`);
            reject(err);
        });
    });
}

async function runTests() {
    try {
        // 测试 1: 首页加载
        console.log('📄 测试 1: 首页 HTML 加载');
        const indexTest = await testEndpoint(siteUrl, '首页');
        
        if (indexTest.success) {
            // 检查关键元素
            const html = indexTest.data;
            const checks = [
                { name: '页面标题', regex: /<title>.*磁检测仪器.*<\/title>/i },
                { name: 'CSS 文件', regex: /main\.css/ },
                { name: '工业样式', regex: /industrial\.css/ },
                { name: '菜单样式', regex: /menu\.css/ },
                { name: '响应式样式', regex: /responsive\.css/ },
                { name: 'Supabase CDN', regex: /supabase-js/ },
                { name: '设备容器', regex: /device-container/ },
                { name: '波形画布', regex: /waveform-canvas/ },
                { name: '状态栏', regex: /status-bar/ },
                { name: 'DOPPLER 品牌', regex: /DOPPLER/ },
                { name: 'NOVASCAN', regex: /NOVASCAN/ },
            ];
            
            console.log('\n🔍 检查页面关键元素:');
            let passedChecks = 0;
            checks.forEach(check => {
                if (check.regex.test(html)) {
                    console.log(`   ✅ ${check.name}`);
                    passedChecks++;
                } else {
                    console.log(`   ❌ ${check.name}`);
                }
            });
            
            console.log(`\n📊 页面元素检查: ${passedChecks}/${checks.length} 通过`);
        }
        
        // 测试 2: CSS 文件加载
        console.log('\n📄 测试 2: CSS 文件加载');
        await testEndpoint(`${siteUrl}/css/main.css`, 'main.css');
        await testEndpoint(`${siteUrl}/css/industrial.css`, 'industrial.css');
        await testEndpoint(`${siteUrl}/css/menu.css`, 'menu.css');
        await testEndpoint(`${siteUrl}/css/responsive.css`, 'responsive.css');
        
        // 测试 3: JS 文件加载
        console.log('\n📄 测试 3: JavaScript 文件加载');
        await testEndpoint(`${siteUrl}/js/config.js`, 'config.js');
        await testEndpoint(`${siteUrl}/js/database.js`, 'database.js');
        await testEndpoint(`${siteUrl}/js/waveform.js`, 'waveform.js');
        await testEndpoint(`${siteUrl}/js/realtime.js`, 'realtime.js');
        
        // 测试 4: 页面文件加载
        console.log('\n📄 测试 4: 子页面加载');
        await testEndpoint(`${siteUrl}/pages/history.html`, 'history.html');
        await testEndpoint(`${siteUrl}/pages/settings.html`, 'settings.html');
        await testEndpoint(`${siteUrl}/pages/reports.html`, 'reports.html');
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 测试完成！');
        console.log('='.repeat(60));
        console.log(`\n🌐 访问链接: ${siteUrl}`);
        console.log('\n✨ 建议：在浏览器中打开链接验证页面显示效果');
        
    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);
        process.exit(1);
    }
}

runTests();
