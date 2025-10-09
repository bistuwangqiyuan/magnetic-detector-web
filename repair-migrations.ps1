# Supabase 迁移修复脚本
# 将远程数据库中的旧迁移标记为已回滚

Write-Host "开始修复 Supabase 迁移历史..." -ForegroundColor Green

$migrations = @(
    "20250411144359", "20250411174325", "20250411174339", "20250411174448",
    "20250411174609", "20250411174812", "20250411175325", "20250429020752",
    "20250429021741", "20250506010246", "20250506010518", "20250506010639",
    "20250506010938", "20250506010957", "20250506011021", "20250506011046",
    "20250506011107", "20250506011130", "20250506011228", "20250506011258",
    "20250506011301", "20250506020344", "20250506020516", "20250506020600",
    "20250506020613", "20250506051426", "20250506051603", "20250506104649",
    "20250506104708", "20250506104727", "20250506104748", "20250506104805",
    "20250506104821", "20250506105005", "20250506105022", "20250506105039",
    "20250506105305", "20250506105333", "20250506111023", "20250506125838",
    "20250506125926", "20250507081748", "20250507081814", "20250507090150",
    "20250507090221", "20250507090245", "20250507092229", "20250507092252"
)

$total = $migrations.Count
$current = 0

foreach ($migration in $migrations) {
    $current++
    Write-Host "[$current/$total] 修复迁移: $migration" -ForegroundColor Cyan
    supabase migration repair --status reverted $migration
    if ($LASTEXITCODE -ne 0) {
        Write-Host "警告: 迁移 $migration 修复失败" -ForegroundColor Yellow
    }
}

Write-Host "`n所有旧迁移已标记为已回滚" -ForegroundColor Green
Write-Host "现在标记当前迁移为已应用..." -ForegroundColor Green

supabase migration repair --status applied 20251008023051

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] 迁移历史修复完成！" -ForegroundColor Green
    Write-Host "数据库设置完成，您现在可以使用应用了。" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] 迁移应用失败" -ForegroundColor Red
    exit 1
}
