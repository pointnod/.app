# `.nod.app` v1.0.0 (Mobile) - Pixel Art Pro

Bienvenue dans le dépôt officiel de l'application **.nod.app** (module d'édition de textures Pixel Art).

Cette application a été initialement conçue selon une architecture web classique, puis refondue dans un **système totalement modulaire** (`.app/.modules/..`), et finalement emballée pour devenir une application **Mobile Native Android (APK)**.

## 🛠️ Architecture Technologique
Ce projet s'articule autour des principes fondateurs suivants :
- **Architecture Modulaire Stricte** : La dépendance de données remonte selon la chaîne `CanvasEngine -> PixelState -> StateManager -> EventBus`.
- **Qualité Premium & Interface** : Design "Glass-Tech" avec mode sombre et micro-animations.
- **Résilience PWA** : Le code agit comme une Progressive Web App, capable de fonctionner totalement hors ligne (Offline Ready).
- **Emballage Natif (Capacitor)** : L'interface web native est conteneurisée via Capacitor CLI vers une plateforme Android pour offrir une expérience `.apk`.
- **Méthodologie** : Toutes les règles de gestion, versioning, et objectifs sont répertoriés dans `GEMINI.md`.

## 🚀 Lancement Rapide (Mode Développement)

Pour tester l'application en temps réel avec Live-Reload (Hot Module Replacement) :

```bash
# 1. Installer les dépendances (si nécessaire)
npm install

# 2. Démarrer le serveur dynamique Vite
npx vite --host
```
Vous pourrez ensuite scanner l'IP générée depuis votre navigateur mobile sur le même réseau local pour vérifier instantanément toutes les modifications.

## 📱 Compilation de l'APK (Production)

L'application est configurée avec **Capacitor**. Pour générer l'archive `.apk` finale destinée aux terminaux Android :

```bash
# 1. Construire les assets web de production (dossier /dist)
npm run build

# 2. Synchroniser le code web dans le conteneur Android
npx cap sync android

# 3. Compiler le binaire via Gradle (sans interface Android Studio)
cd android
./gradlew assembleDebug
```
*Le fichier final sera disponible dans le répertoire `android/app/build/outputs/apk/debug/app-debug.apk`.*
