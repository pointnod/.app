#!/bin/bash
# Setup pour environnement portable

echo "🛠️ Configuration de l'environnement portable..."

# Création de la structure de base si absente
mkdir -p ./.dev-env/{node,godot,git,jdk-17}
mkdir -p ./.backups
mkdir -p ./core/{assets,logic}
mkdir -p ./platforms/{web-mobile,android-apk,godot-engine}
mkdir -p ./scripts

# Instructions de migration
if [ -d "./files" ]; then
    echo "💡 Note : Le contenu de './files' devrait etre deplace dans './platforms/web-mobile/'"
fi

echo "----------------------------------------------------"
echo "Veuillez placer vos binaires portables dans .dev-env/"
echo "Pensez à utiliser 'git config --local' pour ce repo."
echo "----------------------------------------------------"