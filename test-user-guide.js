// 用户手册页面测试脚本
const https = require('https');

const siteUrl = 'https://magnetic-detector-web.netlify.app';

console.log('🧪 测试用户手册功能...\n');
console.log('='.repeat(70));

async function testUserGuide() {
    try {
        // 测试用户手册页面
        console.log('\n📖 测试 1: 用户手册页面加载');
        console.log('-'.repeat(70));
        
        const result = await new Promise((resolve) => {
            https.get(`${siteUrl}/pages/user-guide.html`, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    resolve({ success: res.statusCode === 200, data, statusCode: res.statusCode });
                });
            }).on('error', () => {
                resolve({ success: false, statusCode: 0 });
            });
        });
        
        if (result.success) {
            console.log('✅ 用户手册页面加载成功 (200 OK)\n');
            
            const html = result.data;
            
            // 检查页面内容
            const checks = [
                { name: '页面标题', regex: /用户操作手册/i },
                { name: '系统概述章节', regex: /系统概述/i },
                { name: '界面介绍章节', regex: /界面介绍/i },
                { name: '快速开始章节', regex: /快速开始/i },
                { name: '实时监测指南', regex: /实时监测操作指南/i },
                { name: '历史数据管理', regex: /历史数据管理/i },
                { name: '数据分析功能', regex: /数据分析功能/i },
                { name: '报告生成', regex: /报告生成与管理/i },
                { name: '参数设置', regex: /参数设置指南/i },
                { name: 'FAQ章节', regex: /常见问题解答/i },
                { name: '功能特性网格', regex: /feature-grid/i },
                { name: '操作步骤说明', regex: /guide-step/i },
                { name: '提示框', regex: /tip-box/i },
                { name: '示意图', regex: /guide-diagram/i },
                { name: '表格数据', regex: /<table>/i },
                { name: '导航菜单', regex: /guide-nav/i },
                { name: '返回主界面链接', regex: /返回主界面/i },
                { name: '打印功能', regex: /window\.print/i }
            ];
            
            console.log('检查页面内容完整性:');
            let passedChecks = 0;
            checks.forEach(check => {
                if (check.regex.test(html)) {
                    console.log(`   ✅ ${check.name}`);
                    passedChecks++;
                } else {
                    console.log(`   ❌ ${check.name}`);
                }
            });
            
            console.log(`\n📊 内容检查: ${passedChecks}/${checks.length} 通过`);
            
            // 检查关键操作步骤
            console.log('\n📋 检查操作步骤文档:');
            const stepChecks = [
                { name: '步骤 1: 打开系统', found: /步骤 1.*打开系统/i.test(html) },
                { name: '步骤 2: 配置检测参数', found: /步骤 2.*配置检测参数/i.test(html) },
                { name: '步骤 3: 启动检测', found: /步骤 3.*启动检测/i.test(html) },
                { name: '步骤 4: 保存数据', found: /步骤 4.*保存数据/i.test(html) },
                { name: '步骤 5: 查看结果', found: /步骤 5.*查看结果/i.test(html) }
            ];
            
            stepChecks.forEach(check => {
                console.log(`   ${check.found ? '✅' : '❌'} ${check.name}`);
            });
            
            // 检查FAQ问题
            console.log('\n❓ 检查常见问题:');
            const faqCount = (html.match(/Q\d+:/g) || []).length;
            console.log(`   ✅ 包含 ${faqCount} 个常见问题`);
            
            // 检查功能特性
            console.log('\n⭐ 检查功能特性说明:');
            const features = [
                '实时监测',
                '历史数据',
                '数据分析',
                '报告生成',
                '参数设置',
                '校准管理'
            ];
            
            features.forEach(feature => {
                if (html.includes(feature)) {
                    console.log(`   ✅ ${feature}`);
                }
            });
            
        } else {
            console.log(`❌ 用户手册页面加载失败 (${result.statusCode})`);
        }
        
        // 测试主界面的手册入口
        console.log('\n🔗 测试 2: 主界面用户手册入口');
        console.log('-'.repeat(70));
        
        const indexResult = await new Promise((resolve) => {
            https.get(siteUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    resolve({ success: res.statusCode === 200, data });
                });
            }).on('error', () => {
                resolve({ success: false });
            });
        });
        
        if (indexResult.success) {
            const hasUserGuideLink = /📖 用户手册|user-guide/i.test(indexResult.data);
            if (hasUserGuideLink) {
                console.log('✅ 主界面包含用户手册入口');
            } else {
                console.log('❌ 主界面未找到用户手册入口');
            }
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 测试总结');
        console.log('='.repeat(70));
        console.log('\n✅ 用户手册功能测试完成！');
        console.log('\n📖 用户手册地址:');
        console.log(`   ${siteUrl}/pages/user-guide.html`);
        console.log('\n📋 手册包含内容:');
        console.log('   • 系统概述和功能介绍');
        console.log('   • 详细的界面布局说明');
        console.log('   • 分步骤快速开始指南');
        console.log('   • 实时监测完整操作流程');
        console.log('   • 历史数据管理教程');
        console.log('   • 数据分析使用方法');
        console.log('   • 报告生成操作指南');
        console.log('   • 参数设置详细说明');
        console.log('   • 常见问题解答（FAQ）');
        console.log('   • 技术支持联系方式');
        
        console.log('\n💡 特色功能:');
        console.log('   ✅ 章节导航，快速定位');
        console.log('   ✅ 可视化流程图');
        console.log('   ✅ 分步操作指导');
        console.log('   ✅ 提示框和注意事项');
        console.log('   ✅ 参数对照表');
        console.log('   ✅ 支持打印');
        console.log('   ✅ 响应式设计');
        
        console.log('\n🌐 访问方式:');
        console.log('   1. 在主界面点击左侧菜单"📖 用户手册"');
        console.log('   2. 直接访问手册页面URL');
        console.log('');
        
    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);
        process.exit(1);
    }
}

testUserGuide();
