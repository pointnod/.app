# pointnod-app | Monorepo Ecosystème Art & Code

Répertoire unifié pour le développement multi-plateforme de l'écosystème **pointnod-app**.

## 📂 Structure du Projet
- `/core` : Source de vérité (Assets JSON, Design Rules, Logique métier partagée).
- `/platforms` :
    - `/web-mobile` : Application PWA (HTML/JS) — Cœur applicatif **pointnod-app**.
    - `/android-apk` : Projet Capacitor / Android Studio — Cible APK native.
    - `/godot-engine` : Version haute performance (Godot / GDScript).
- `/scripts` : Outils d'automatisation (Backup, Sync, Server).
- `/.dev-env` : Binaires portables (Node, JDK, Godot) - *Ignoré par Git*.
- `/.backups` : Sauvegardes locales compressées - *Ignoré par Git*.

## 🛠️ Environnement Portable
1. Exécutez `setup-env.sh` pour initialiser la structure.
2. Lancez `start-dev.bat` (Windows) pour charger les variables d'environnement locales.

## 🔄 Flux de Travail
- **Modification Assets** : Toujours modifier dans `/core/assets`.
- **Synchronisation** : Exécutez `./scripts/sync-assets.sh` pour propager les changements.
- **Backup** : Exécutez `./scripts/backup.sh` avant chaque fin de session.

## 🌿 Branches
- `main` : Stable & Releases.
- `dev-web` : Développement actif Web.
- `dev-android` : Intégration native APK.
- `dev-godot` : Développement moteur Godot.