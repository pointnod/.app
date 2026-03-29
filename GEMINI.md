# Méthodologie de Collaboration et Développement

Ce document définit les règles, principes et standards qui régissent la collaboration entre l'utilisateur et l'assistant Antigravity sur le développement de l'écosystème `.app` (anciennement `.nod`).

## 1. Objectifs et Principes de Collaboration
* **Source de Vérité Vivante** : Ce fichier `GEMINI.md` doit être obligatoirement mis à jour à chaque nouvelle itération majeure.
* **Architecture Monorepo Multi-Cible** : Le projet combine désormais trois plateformes (`web-mobile`, `android-apk`, `godot-engine`) partageant un noyau logique et d'assets situé dans `/core`.
* **Environnement Standalone & Portable** : Aucun outil (Node, Godot, Git) ne doit être installé globalement. Tout réside dans `.dev-env/`. L'utilisation de `start-dev.bat` est obligatoire pour initialiser les variables d'environnement locales.
* **Développement Piloté par l'Architecture** : Chaque modification doit s'inscrire rigoureusement dans l'architecture définie (hiérarchie modulaire stricte).
* **Qualité Visuelle Premium** : Un focus systématique est mis sur l'impact visuel ("Glass-Tech", Dark mode premium). 
* **Sécurité & Versioning (Règle Absolue)** : Chaque session commence par une vérification GIT et se termine par un `./scripts/backup.ps1`. Un fichier `CHANGELOG.md` doit être mis à jour à chaque itération majeure ou correctif critique.
* **Code Pédagogique (Règle Absolue)** : Le code produit doit systèmatiquement être annoté de manière claire, éducative et pédagogique.
* **Stratégie de Merge** : Utilisation de snapshots Git réguliers. Pour chaque session, un commit descriptif résumant les changements est obligatoire.

## 2. Structure des Livrables
* **Dashboard Launcher (`index.html` racine)** : Le point d'entrée visuel premium pour gérer les serveurs et builds.
* **Plateformes (`/platforms`)** : Code source isolé par cible.
* **Noyau Partagé (`/core`)** : Unique source de vérité pour le Design System et la logique transcendante.
* **Scripts (`/scripts`)** : Utilitaires de synchronisation et de sauvegarde.

## 3. Processus de Traitement des Demandes
1. **Analyse & Clarification** : Avant d'exécuter des requêtes à fort impact.
2. **Planification (Planning Mode)** : Pour toute évolution majeure.
3. **Découpage & Exécution** : Travail guidé par `task.md`.
4. **Validation et Test** : Serveurs Vite (HMR) pour le web, Gradle pour Android.

## 4. Conventions de Style et de Documentation
* **Nomenclature et Architecture Modulaire** : Le système est agencé par domaines stricts (`.app`, `.modules`, `Commandes`, `Interface`, `Kernel`). Les dépendances obéissent à un arbre décisionnel strict (ex: `Commandes` -> `State` -> `StateManager` -> `EventBus`). 
* **Design System Centralisé** : Utilisation exclusive des tokens et variables issus de `design-rules.css` (couleurs, variables glassmorphism, espacements). Toute inclusion d'outils externes dérogeant à cette esthétique nécessite la validation de l'utilisateur.
* **JSDoc et Commentaires** : L'utilisation de commentaires multi-lignes clairs sur chaque classe et module principal est la norme pour assurer la continuité pédagogique du projet.

## 5. Gestion des Décisions, Changements et Retours
* **Flexibilité Face à l'Erreur** : Lors d'exceptions ou d'erreurs consoles (ex. erreurs système du robot, échecs serveurs), le contexte de l'erreur brute est remonté. L'assistant pivote et suggère de nouvelles voies à l'utilisateur si la correction logicielle automatique échoue.
* **Avertissements Visuels** : L'utilisation des bannières d'alerte (`> [!IMPORTANT]`, `> [!WARNING]`) est requise pour notifier l'utilisateur de changements cassants ou de besoins de décisions en architecture.
* **Suivi des Retours** : Les consignes exceptionnelles apportées par l'utilisateur (comme des graphes de dépendances spécifiques ou de strictes conditions d'import) priment systématiquement sur le plan d'action initial de l'assistant.
