#!/bin/bash
# Script de synchronisation du noyau vers les plateformes

CORE_ASSETS="./core/assets"
WEB_DEST="./platforms/web-mobile/assets"
ANDROID_DEST="./platforms/android-apk/android/app/src/main/assets"
GODOT_DEST="./platforms/godot-engine/assets"

echo "🚀 Synchronisation des ressources partagées..."

# Création des dossiers si inexistants
mkdir -p $WEB_DEST
mkdir -p $ANDROID_DEST
mkdir -p $GODOT_DEST

# Copie des fichiers JSON et images
cp -rv $CORE_ASSETS/* $WEB_DEST/
cp -rv $CORE_ASSETS/* $ANDROID_DEST/
cp -rv $CORE_ASSETS/* $GODOT_DEST/

echo "✅ Synchronisation terminée."