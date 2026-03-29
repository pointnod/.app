#!/bin/bash
# Script de backup portable
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="monorepo_pixel_art_$TIMESTAMP.tar.gz"

echo "📦 Création de l'archive de sauvegarde..."
mkdir -p ../.backups

tar --exclude='../.backups' --exclude='../.git' --exclude='../.dev-env' --exclude='../**/node_modules' -czf ../.backups/$BACKUP_NAME ../

echo "✅ Sauvegarde terminée : .backups/$BACKUP_NAME"