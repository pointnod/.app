#!/bin/bash
# Setup pour environnement portable

echo "🛠️ Configuration de l'environnement portable..."

# Création de la structure de base si absente
mkdir -p ../.dev-env/{node,godot,git}
mkdir -p ../.backups
mkdir -p ../core/assets

echo "----------------------------------------------------"
echo "Veuillez placer vos binaires portables dans .dev-env/"
echo "Pensez à utiliser 'git config --local' pour ce repo."
echo "----------------------------------------------------"