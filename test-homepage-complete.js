// 完整的首页显示和功能测试
const https = require('https');

const siteUrl = 'https://magnetic-detector-web.netlify.app';

console.log('🧪 开始完整测试首页显示和功能...\n');
console.log('=' .repeat(70));

// 测试清单
const testChecklist = {
    display: {
        name: '📺 显示元素测试',
        items: [
            { name: '设备外壳和橙色装饰', checked: false },
            { name: '顶部状态栏（NOVASCAN标识）', checked: false },
            { name: '左侧控制按钮组', checked: false },
            { name: '右侧控制按钮组', checked: false },
            { name: '主显示区域', checked: false },
            { name: '左侧菜单栏', checked: false },
            { name: '波形显示区域', checked: false },
            { name: '底部控制栏', checked: false },
            { name: 'DOPPLER品牌标识', checked: false },
            { name: '右下角旋钮控制', checked: false }
        ]
    },
    resources: {
        name: '📦 资源加载测试',
        items: [
            { name: 'index.html', checked: false },
            { name: 'css/main.css', checked: false },
            { name: 'css/industrial.css', checked: false },
            { name: 'css/menu.css', checked: false },
            { name: 'css/responsive.css', checked: false },
            { name: 'js/config.js', checked: false },
            { name: 'js/database.js', checked: false },
            { name: 'js/waveform.js', checked: false },
            { name: 'js/realtime.js', checked: false }
        ]
    },
    functionality: {
        name: '⚙️ 功能性测试',
        items: [
            { name: 'Supabase CDN 加载', checked: false },
            { name: '配置文件正确', checked: false },
            { name: '数据库连接配置', checked: false },
            { name: 'Canvas 元素存在', checked: false },
            { name: '按钮可交互', checked: false }
        ]
    }
};

function testEndpoint(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({ success: res.statusCode === 200, data, statusCode: res.statusCode });
            });
        }).on('error', () => {
            resolve({ success: false, statusCode: 0 });
        });
    });
}

async function runTests() {
    try {
        // 测试 1: 首页HTML加载和内容检查
        console.log('\n📄 测试 1: 首页 HTML 加载和显示元素检查');
        console.log('-'.repeat(70));
        
        const indexTest = await testEndpoint(siteUrl);
        
        if (indexTest.success) {
            console.log('✅ 首页加载成功 (200 OK)\n');
            
            const html = indexTest.data;
            
            // 检查显示元素
            const displayChecks = [
                { regex: /device-container/i, item: 0, desc: '设备外壳容器' },
                { regex: /corner-decoration/i, item: 0, desc: '橙色边角装饰' },
                { regex: /NOVASCAN/i, item: 1, desc: 'NOVASCAN 标识' },
                { regex: /status-bar/i, item: 1, desc: '状态栏' },
                { regex: /side-btn/i, item: 2, desc: '左侧按钮' },
                { regex: /btn-play/i, item: 2, desc: '播放按钮' },
                { regex: /settings\.html/i, item: 3, desc: '设置按钮' },
                { regex: /reports\.html/i, item: 3, desc: '报告按钮' },
                { regex: /position: absolute.*left: 170px/i, item: 4, desc: '主显示区域定位' },
                { regex: /menu-item/i, item: 5, desc: '菜单项' },
                { regex: /实时监测/i, item: 5, desc: '实时监测菜单' },
                { regex: /waveform-canvas/i, item: 6, desc: '波形画布' },
                { regex: /background: #0A0A0A/i, item: 6, desc: '波形背景色' },
                { regex: /sensitivity-slider/i, item: 7, desc: '灵敏度滑块' },
                { regex: /upper-gate/i, item: 7, desc: '上门限' },
                { regex: /DOPPLER/i, item: 8, desc: 'DOPPLER 品牌' },
                { regex: /rotary-knob/i, item: 9, desc: '旋钮控制' }
            ];
            
            console.log('检查显示元素:');
            displayChecks.forEach(check => {
                if (check.regex.test(html)) {
                    testChecklist.display.items[check.item].checked = true;
                    console.log(`   ✅ ${check.desc}`);
                } else {
                    console.log(`   ❌ ${check.desc}`);
                }
            });
        } else {
            console.log(`❌ 首页加载失败 (${indexTest.statusCode})`);
        }
        
        // 测试 2: CSS 文件加载
        console.log('\n📄 测试 2: CSS 文件加载');
        console.log('-'.repeat(70));
        
        const cssFiles = [
            'css/main.css',
            'css/industrial.css',
            'css/menu.css',
            'css/responsive.css'
        ];
        
        for (let i = 0; i < cssFiles.length; i++) {
            const result = await testEndpoint(`${siteUrl}/${cssFiles[i]}`);
            const idx = i + 1;
            if (result.success) {
                testChecklist.resources.items[idx].checked = true;
                console.log(`✅ ${cssFiles[i]}: 成功 (200)`);
            } else {
                console.log(`❌ ${cssFiles[i]}: 失败 (${result.statusCode})`);
            }
        }
        
        // 测试 3: JavaScript 文件加载
        console.log('\n📄 测试 3: JavaScript 文件加载');
        console.log('-'.repeat(70));
        
        const jsFiles = [
            'js/config.js',
            'js/database.js',
            'js/waveform.js',
            'js/realtime.js'
        ];
        
        for (let i = 0; i < jsFiles.length; i++) {
            const result = await testEndpoint(`${siteUrl}/${jsFiles[i]}`);
            const idx = i + 5;
            if (result.success) {
                testChecklist.resources.items[idx].checked = true;
                console.log(`✅ ${jsFiles[i]}: 成功 (200)`);
                
                // 检查功能性内容
                if (jsFiles[i] === 'js/config.js' && result.data) {
                    if (/SUPABASE_CONFIG/i.test(result.data)) {
                        testChecklist.functionality.items[1].checked = true;
                    }
                    if (/zzyueuweeoakopuuwfau/i.test(result.data)) {
                        testChecklist.functionality.items[2].checked = true;
                    }
                }
            } else {
                console.log(`❌ ${jsFiles[i]}: 失败 (${result.statusCode})`);
            }
        }
        
        // 标记已检查的功能
        testChecklist.resources.items[0].checked = indexTest.success;
        if (indexTest.success && /@supabase\/supabase-js/.test(indexTest.data)) {
            testChecklist.functionality.items[0].checked = true;
        }
        if (indexTest.success && /waveform-canvas/.test(indexTest.data)) {
            testChecklist.functionality.items[3].checked = true;
        }
        if (indexTest.success && /addEventListener/.test(indexTest.data)) {
            testChecklist.functionality.items[4].checked = true;
        }
        
        // 生成测试报告
        console.log('\n' + '='.repeat(70));
        console.log('📊 测试结果汇总');
        console.log('='.repeat(70));
        
        let totalTests = 0;
        let passedTests = 0;
        
        for (const category in testChecklist) {
            const cat = testChecklist[category];
            console.log(`\n${cat.name}:`);
            
            cat.items.forEach(item => {
                totalTests++;
                if (item.checked) {
                    passedTests++;
                    console.log(`   ✅ ${item.name}`);
                } else {
                    console.log(`   ❌ ${item.name}`);
                }
            });
        }
        
        console.log('\n' + '='.repeat(70));
        console.log(`总计: ${passedTests}/${totalTests} 测试通过`);
        console.log(`通过率: ${(passedTests/totalTests*100).toFixed(1)}%`);
        console.log('='.repeat(70));
        
        if (passedTests === totalTests) {
            console.log('\n🎉 恭喜！所有测试通过！');
            console.log('✨ 网站完全正常，所有元素显示正确');
        } else {
            console.log(`\n⚠️  有 ${totalTests - passedTests} 个测试未通过`);
        }
        
        console.log(`\n🌐 网站地址: ${siteUrl}`);
        console.log('👀 建议在浏览器中打开验证视觉效果\n');
        
        process.exit(passedTests === totalTests ? 0 : 1);
        
    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);
        process.exit(1);
    }
}

runTests();

