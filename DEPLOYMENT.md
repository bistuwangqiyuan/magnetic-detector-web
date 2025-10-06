# 磁检测仪器网页版 - 部署指南

## 📦 部署概述

本文档提供完整的部署流程，包括Netlify、Vercel和自定义服务器部署方案。

---

## 1. 前置准备

### 1.1 必须完成的步骤 ⚠️

1. **初始化Supabase数据库**
   ```sql
   -- 在Supabase SQL Editor中执行 DATABASE_SCHEMA.md 的完整脚本
   -- 创建6个核心表：
   -- - test_records
   -- - waveform_data
   -- - defects
   -- - calibration_settings
   -- - test_templates
   -- - reports
   ```

2. **验证数据库连接**
   - 确保Supabase项目URL正确
   - 验证API Key有效
   - 测试基本的CRUD操作

3. **代码已推送到GitHub**
   - 仓库地址：https://github.com/bistuwangqiyuan/magnetic-detector-web
   - 确保所有文件已提交

---

## 2. Netlify 部署（推荐）

### 2.1 通过Git连接部署

#### 步骤1：登录Netlify
访问：https://app.netlify.com

#### 步骤2：导入项目
1. 点击 "Add new site" → "Import an existing project"
2. 选择 "Deploy with GitHub"
3. 授权并选择仓库：`bistuwangqiyuan/magnetic-detector-web`

#### 步骤3：配置构建设置
```
Build command: (留空)
Publish directory: .
```

#### 步骤4：配置环境变量（可选）
如果需要隐藏Supabase密钥：
```
PUBLIC_SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

#### 步骤5：部署
点击 "Deploy site" 按钮，等待部署完成（约1-2分钟）

### 2.2 配置文件

创建 `netlify.toml`（可选）：

```toml
[build]
  publish = "."
  command = ""

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    
[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    
[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    
[[headers]]
  for = "*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = {Role = ["public"]}
```

---

## 3. Vercel 部署

### 3.1 通过Git连接部署

#### 步骤1：登录Vercel
访问：https://vercel.com/login

#### 步骤2：导入项目
1. 点击 "Add New..." → "Project"
2. 选择 "Import Git Repository"
3. 选择GitHub仓库：`bistuwangqiyuan/magnetic-detector-web`

#### 步骤3：配置项目
```
Framework Preset: Other
Root Directory: ./
Output Directory: (留空)
Build Command: (留空)
Install Command: (留空)
```

#### 步骤4：环境变量（可选）
添加环境变量（如需要）

#### 步骤5：部署
点击 "Deploy" 按钮，等待部署完成

### 3.2 配置文件

创建 `vercel.json`（可选）：

```json
{
  "version": 2,
  "public": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 4. 自定义服务器部署

### 4.1 使用Nginx

#### 安装Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 配置Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/magnetic-detector;
    index index.html;

    # 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存策略
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(html)$ {
        expires 0;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    # SPA路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头部
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

#### 部署步骤
```bash
# 1. 上传文件到服务器
scp -r * user@your-server:/var/www/magnetic-detector/

# 2. 重新加载Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 4.2 使用Apache

#### 配置Apache
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/magnetic-detector

    <Directory /var/www/magnetic-detector>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA路由
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # 压缩
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
    </IfModule>

    # 缓存
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/html "access plus 0 seconds"
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/* "access plus 1 year"
    </IfModule>
</VirtualHost>
```

---

## 5. Docker 部署

### 5.1 Dockerfile

创建 `Dockerfile`：

```dockerfile
FROM nginx:alpine

# 复制项目文件
COPY . /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 5.2 Nginx配置

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.3 构建和运行

```bash
# 构建镜像
docker build -t magnetic-detector-web .

# 运行容器
docker run -d -p 8080:80 --name magnetic-detector magnetic-detector-web

# 访问
# http://localhost:8080
```

### 5.4 Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

运行：
```bash
docker-compose up -d
```

---

## 6. 环境变量管理

### 6.1 开发环境

```bash
# .env.development
PUBLIC_SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_dev_key
```

### 6.2 生产环境

**Netlify/Vercel**：
- 在Web界面的Environment Variables中配置

**自定义服务器**：
```bash
# 使用环境变量
export PUBLIC_SUPABASE_URL="https://..."
export PUBLIC_SUPABASE_ANON_KEY="..."

# 或修改js/config.js直接配置（不推荐）
```

---

## 7. 性能优化

### 7.1 资源优化

1. **启用Gzip压缩**
   - 所有服务器都应启用
   - 减少传输大小60-80%

2. **设置缓存策略**
   ```
   HTML: no-cache (实时更新)
   CSS/JS: 1年缓存 (使用版本号)
   图片: 1年缓存
   ```

3. **使用CDN**
   - Netlify和Vercel自带CDN
   - 自定义服务器可使用Cloudflare

### 7.2 代码优化

1. **压缩JS/CSS**（可选）
   ```bash
   # 使用terser压缩JS
   npx terser js/*.js --compress --mangle -o dist/app.min.js
   
   # 使用cssnano压缩CSS
   npx cssnano css/*.css dist/style.min.css
   ```

2. **图片优化**
   - 使用WebP格式
   - 压缩PNG/JPEG

---

## 8. SSL/HTTPS配置

### 8.1 Netlify/Vercel
- 自动提供免费SSL证书
- 支持自定义域名HTTPS

### 8.2 Let's Encrypt（自定义服务器）

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 9. 监控和日志

### 9.1 错误监控

推荐使用：
- **Sentry**：前端错误监控
- **Google Analytics**：用户行为分析
- **Hotjar**：用户体验分析

### 9.2 性能监控

- **Lighthouse**：定期性能评估
- **WebPageTest**：全面性能测试
- **GTmetrix**：页面加载分析

---

## 10. 部署检查清单

### 10.1 部署前检查 ✅

- [ ] 代码已提交到GitHub
- [ ] Supabase数据库已初始化
- [ ] 环境变量已配置
- [ ] 测试通过（参考TESTING.md）
- [ ] 文档已更新

### 10.2 部署后验证 ✅

- [ ] 网站可以正常访问
- [ ] 所有页面正常加载
- [ ] Supabase连接正常
- [ ] 波形显示正常
- [ ] 数据可以保存和读取
- [ ] 无JavaScript错误
- [ ] HTTPS正常工作
- [ ] 性能达标（Lighthouse > 90）

---

## 11. 回滚策略

### 11.1 Netlify/Vercel

- 在部署历史中点击"Restore"
- 或重新部署旧的Git提交

### 11.2 自定义服务器

```bash
# 保留备份
cp -r /var/www/magnetic-detector /var/www/magnetic-detector-backup-$(date +%Y%m%d)

# 回滚
mv /var/www/magnetic-detector-backup-20251006 /var/www/magnetic-detector
sudo systemctl reload nginx
```

---

## 12. 常见问题

### Q1: 部署后页面空白
**A**: 检查浏览器控制台错误，通常是路径问题或JavaScript错误

### Q2: Supabase连接失败
**A**: 
1. 检查URL和API Key是否正确
2. 检查数据库表是否已创建
3. 检查网络连接

### Q3: 波形不显示
**A**: 
1. 检查Canvas元素是否正确渲染
2. 检查浏览器是否支持Canvas API
3. 查看控制台是否有错误

### Q4: 性能较差
**A**: 
1. 启用Gzip压缩
2. 使用CDN加速
3. 优化图片和资源
4. 检查数据量是否过大

---

## 13. 维护建议

### 13.1 定期维护

- **每周**：检查网站运行状态
- **每月**：查看性能指标，优化慢查询
- **每季度**：更新依赖库，安全补丁
- **每年**：全面性能审计，架构优化

### 13.2 备份策略

- **代码**：Git版本控制
- **数据库**：Supabase自动备份
- **配置**：文档化所有配置

---

## 14. 联系支持

遇到问题？

1. 查看项目README.md
2. 查看TESTING.md了解已知问题
3. 检查GitHub Issues
4. 联系开发团队

---

**部署指南版本**：v1.0.0  
**最后更新**：2025-10-06  
**维护者**：bistuwangqiyuan

🚀 **祝部署顺利！**
