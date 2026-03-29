# nod.app — v1.0.0 (Pixel Module) (Mobile)

> Éditeur de Pixel Art modulaire pour mobile Android, construit sur une architecture PWA+Capacitor.

## 🏗️ Architecture

L'application est organisée selon une **séparation stricte** entre le code source web et le wrapper natif Android :

```
├── GEMINI.md                       # Méthodologie de collaboration
├── README.md                       # Ce fichier
├── nod_architecture_overview.svg   # Schéma d'architecture
│
└── files/                          # ══ APPLICATION WEB ══
    ├── index.html                  # Point d'entrée HTML
    ├── manifest.json               # Configuration PWA
    ├── sw.js                       # Service Worker (mode offline)
    ├── capacitor.config.json       # Pont Web ↔ Native
    ├── package.json                # Dépendances & scripts npm
    │
    ├── css/                        # Design System (Glass-Tech)
    │   ├── design-rules.css        #   → Tokens, variables CSS
    │   └── style.css               #   → Styles principaux
    │
    ├── .app/                       # ══ CŒUR APPLICATIF ══
    │   ├── App.js                  #   → Bootstrap principal
    │   └── .modules/
    │       ├── core/               #   → EventBus, StateManager, Registry
    │       ├── tools/              #   → PixelModule, PixelState
    │       │   ├── ui/             #   → PixelUI
    │       │   └── state/          #   → PixelState
    │       └── ui/                 #   → Sidebar, Tutorial, Rulers
    │
    └── android/                    # ══ APP NATIVE (Capacitor) ══
        ├── app/                    #   → Code source Android
        ├── gradle/                 #   → Wrapper Gradle
        └── build.gradle            #   → Configuration de compilation
```

## 🚀 Commandes

| Commande               | Action                                               |
|------------------------|------------------------------------------------------|
| `npm install`          | Installe les dépendances                             |
| `npm run dev`          | Serveur de dev local (Vite + Live Reload)             |
| `npx vite --host`     | Serveur accessible sur réseau local (test mobile)     |
| `npm run build`        | Génère le build de production dans `dist/`            |
| `npx cap sync android`| Synchronise le build vers le projet Android natif     |

## 📱 Test Mobile en Temps Réel

1. Lancer le serveur : `npx vite --host` depuis `files/`
2. Ouvrir l'URL réseau (ex: `http://192.168.1.14:5173`) sur votre Android
3. Chaque modification de code est reflétée instantanément

## 📦 Compilation APK

> **Prérequis** : JDK 17 installé et `JAVA_HOME` configuré.

```bash
cd files
npm run build                    # Build web
npx cap sync android             # Synchronisation
cd android
./gradlew assembleDebug          # Compilation APK
```

Le fichier `.apk` sera dans `android/app/build/outputs/apk/debug/`.

## 🧬 Graphe de Dépendances

```
EventBus ← StateManager ← PixelState ← PixelModule / PixelUI / RulerController
                                 ↑
                  CanvasEngine / ToolEngine / PaletteEngine / HistoryEngine
```
