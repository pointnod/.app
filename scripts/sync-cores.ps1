# scripts/sync-cores.ps1 - Synchronisation de l'ecosysteme .app

$root = "$PSScriptRoot/.."
$coreAssets = "$root/core/assets"
$coreTheme = "$root/core/theme"

# Plateformes cibles
$targets = @(
    "$root/platforms/web-mobile/css",
    "$root/platforms/android-apk/app/src/main/assets/css",
    "$root/platforms/godot-engine/theme"
)

Write-Host "[:] Synchronisation du Design System (Core) vers les plateformes..." -ForegroundColor Cyan

foreach ($target in $targets) {
    if (!(Test-Path $target)) { New-Item -ItemType Directory -Path $target -Force | Out-Null }
    
    # Sync CSS / Design Rules
    Copy-Item -Path "$coreTheme/*" -Destination $target -Recurse -Force -ErrorAction SilentlyContinue
    
    # Sync Assets
    Copy-Item -Path "$coreAssets/*" -Destination $target -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "[OK] Toutes les plateformes sont synchronisees avec Core/." -ForegroundColor Green
