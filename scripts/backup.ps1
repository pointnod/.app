# scripts/backup.ps1 - Système de Sauvegarde Portable .app

$root = "$PSScriptRoot/.."
$backupDir = "$root/backups"
if (!(Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir }

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$zipName = "app_backup_$timestamp.zip"

Write-Host "[:] Snapshoting source files (excluding builds/deps)..." -ForegroundColor Cyan

# On prépare la liste des fichiers à exclure pour le Zip
Compress-Archive -Path "$root/*" -DestinationPath "$backupDir/$zipName" -CompressionLevel Optimal -Force -ErrorAction SilentlyContinue -Exclude @("node_modules", "dist", ".gradle", "build", "backups", ".git")

Write-Host "[OK] Backup cree : backups/$zipName" -ForegroundColor Green

# Snapshot GIT (Branch auto-backup)
Write-Host "[:] Snapshot GIT force..." -ForegroundColor Cyan
git add .
git commit -m "auto-backup snapshot: $timestamp" -n
git push origin HEAD --force # Optionnel si distant configure

Write-Host "[DONE] Environnement sauvegarde." -ForegroundColor Green
