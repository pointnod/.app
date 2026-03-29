# Changelog — pointnod-app

Toutes les modifications majeures apportées à l'écosystème pointnod-app seront consignées ici.

## [v1.1.0] - 2026-03-29 (Current)
### 🔄 Restructuration Monorepo
- **Migration Nomenclature** : Suppression systématique des préfixes `.` pour éviter les erreurs de serveur (Vite/Node). 
    - `.app` → `pointnod-app`
    - `.modules` → `modules`
- **Architecture Multi-Plateforme** : Structure `platforms/` unifiée pour `web-mobile`, `android-apk` et `godot-engine`.
- **Noyau Unifié** : Déplacement de la logique dans `core/` et assets partagés.

### 🐛 Correctifs de Stabilité (Hotfixes)
- **JS Syntax Repairs** : Correction des appels `appendChild` et `apply` corrompus par le renommage global.
- **Ruler Fix** : Rétablissement des références `rulerH` et `rulerV` dans `RulerController`.
- **Private Fields** : Réparation des accès aux champs privés (`#canvas.apply`) dans `PixelModule`.
- **Vite Redirects** : Correction de l'erreur `Cannot GET /files/index.html` en forçant la racine sur `platforms/web-mobile`.

### 🚀 Environnement & Outillage
- **Dashboard Launcher** : Création d'un `index.html` à la racine servant de hub visuel "Glass-Tech".
- **Portable Dev Env** : Mise à jour de `start-dev.bat` avec nettoyage automatique des processus `node.exe` fantômes.
- **Backup Script** : Versioning via Git SNAPSHOTS + Export ZIP sécurisé.

---

## [v1.0.0] - 2026-03-28
- Initialisation de la version Pixel Art Mobile.
- Déploiement système de bus d'évènements et StateManager.
