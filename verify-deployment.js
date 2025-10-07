/**
 * 部署验证脚本
 * 用于在Node.js环境中验证文件完整性
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
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

// 必需的文件和目录
const requiredFiles = [
    'index.html',
    'netlify.toml',
    'js/config.js',
    'js/database.js',
    'js/waveform.js',
    'js/realtime.js',
    'js/analysis.js',
    'js/report.js',
    'css/main.css',
    'css/industrial.css',
    'css/responsive.css',
    'pages/history.html',
    'pages/analysis.html',
    'pages/reports.html',
    'pages/settings.html',
    'pages/calibration.html',
    'test-deployment.html',
    'DEPLOYMENT_TEST_REPORT.md'
];

// 检查文件是否存在
function checkFileExists(filePath) {
    return fs.existsSync(filePath);
}

// 检查HTML文件是否包含必要的脚本
function checkHTMLDependencies(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const checks = {
        hasSupabase: content.includes('supabase-js'),
        hasConfig: content.includes('config.js'),
        hasDatabase: content.includes('database.js')
    };
    return checks;
}

// 检查JS文件语法
function checkJSSyntax(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // 基本语法检查
        const hasUnmatchedBraces = (content.match(/{/g) || []).length !== (content.match(/}/g) || []).length;
        const hasUnmatchedParens = (content.match(/\(/g) || []).length !== (content.match(/\)/g) || []).length;
        
        return {
            valid: !hasUnmatchedBraces && !hasUnmatchedParens,
            hasUnmatchedBraces,
            hasUnmatchedParens
        };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

// 主验证函数
function verifyDeployment() {
    log('\n========================================', 'cyan');
    log('   部署文件验证', 'cyan');
    log('========================================\n', 'cyan');

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    // 1. 检查必需文件
    log('📄 检查必需文件...', 'yellow');
    requiredFiles.forEach(file => {
        totalTests++;
        if (checkFileExists(file)) {
            log(`  ✅ ${file}`, 'green');
            passedTests++;
        } else {
            log(`  ❌ ${file} 缺失！`, 'red');
            failedTests++;
        }
    });

    // 2. 检查HTML页面依赖
    log('\n📚 检查HTML页面依赖...', 'yellow');
    const htmlPages = [
        { path: 'pages/analysis.html', needsDB: true },
        { path: 'pages/settings.html', needsDB: true },
        { path: 'pages/history.html', needsDB: true },
        { path: 'pages/reports.html', needsDB: true },
        { path: 'pages/calibration.html', needsDB: true }
    ];

    htmlPages.forEach(page => {
        if (checkFileExists(page.path)) {
            const deps = checkHTMLDependencies(page.path);
            totalTests += 2;
            
            if (deps.hasConfig) {
                log(`  ✅ ${page.path} - config.js 已加载`, 'green');
                passedTests++;
            } else {
                log(`  ❌ ${page.path} - config.js 未加载！`, 'red');
                failedTests++;
            }

            if (page.needsDB) {
                if (deps.hasSupabase && deps.hasDatabase) {
                    log(`  ✅ ${page.path} - 数据库依赖已加载`, 'green');
                    passedTests++;
                } else {
                    log(`  ❌ ${page.path} - 数据库依赖缺失！`, 'red');
                    failedTests++;
                }
            } else {
                totalTests--;
            }
        }
    });

    // 3. 检查JS文件语法
    log('\n🔧 检查JS文件语法...', 'yellow');
    const jsFiles = requiredFiles.filter(f => f.endsWith('.js'));
    jsFiles.forEach(file => {
        if (checkFileExists(file)) {
            totalTests++;
            const syntax = checkJSSyntax(file);
            if (syntax.valid) {
                log(`  ✅ ${file} - 语法正确`, 'green');
                passedTests++;
            } else {
                log(`  ❌ ${file} - 语法错误！`, 'red');
                if (syntax.hasUnmatchedBraces) log(`     - 括号不匹配`, 'red');
                if (syntax.hasUnmatchedParens) log(`     - 圆括号不匹配`, 'red');
                if (syntax.error) log(`     - ${syntax.error}`, 'red');
                failedTests++;
            }
        }
    });

    // 4. 检查netlify.toml配置
    log('\n⚙️  检查Netlify配置...', 'yellow');
    if (checkFileExists('netlify.toml')) {
        totalTests++;
        const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
        const hasPublish = netlifyConfig.includes('publish');
        const hasHeaders = netlifyConfig.includes('[[headers]]');
        
        if (hasPublish && hasHeaders) {
            log(`  ✅ netlify.toml - 配置完整`, 'green');
            passedTests++;
        } else {
            log(`  ❌ netlify.toml - 配置不完整`, 'red');
            failedTests++;
        }
    }

    // 输出总结
    log('\n========================================', 'cyan');
    log('   测试总结', 'cyan');
    log('========================================', 'cyan');
    log(`总测试数: ${totalTests}`);
    log(`通过: ${passedTests}`, 'green');
    log(`失败: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
    log(`通过率: ${Math.round(passedTests / totalTests * 100)}%`, failedTests > 0 ? 'yellow' : 'green');
    
    if (failedTests === 0) {
        log('\n✅ 所有检查通过！可以部署。', 'green');
        return true;
    } else {
        log(`\n❌ 有 ${failedTests} 个检查失败，请修复后再部署。`, 'red');
        return false;
    }
}

// 运行验证
const result = verifyDeployment();
process.exit(result ? 0 : 1);
