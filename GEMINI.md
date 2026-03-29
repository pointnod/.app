# Méthodologie de Collaboration et Développement

Ce document définit les règles, principes et standards qui régissent la collaboration entre l'utilisateur et l'assistant Antigravity sur le développement de l'écosystème `.app` (anciennement `.nod`).

## 1. Objectifs et Principes de Collaboration
* **Source de Vérité Vivante** : Ce fichier `GEMINI.md` doit être obligatoirement mis à jour à chaque nouvelle itération majeure, changement de paradigme ou introduction de nouveaux outils, pour rester la source de vérité absolue du projet.
* **Ciblage Mobile (v1.0.0)** : Le livrable final de cette application est une **APK Android Native (`.nod.app v1.0.0 (mobile)`)**. L'approche utilise une enveloppe PWA robuste transcodée via Capacitor CLI, en s'appuyant sur les environnements Java et Gradle locaux du profil de développement, sans nécessiter Android Studio.
* **Développement Piloté par l'Architecture** : Chaque modification doit s'inscrire rigoureusement dans l'architecture définie (hiérarchie modulaire stricte, graphe de dépendance unidirectionnel).
* **Qualité Visuelle Premium** : Un focus systématique est mis sur l'impact visuel de l'application ("Glass-Tech", Dark mode premium, micro-animations). L'expérience utilisateur (UX/UI) compte autant que le code sous-jacent.
* **Sécurité & Versioning (Règle Absolue)** : Chaque nouvelle itération majeure doit être précédée et/ou suivie par une sauvegarde (commit Git). L'objectif est de toujours conserver une trace fonctionnelle et d'éviter la perte d'une version stable.
* **Code Pédagogique (Règle Absolue)** : Le code produit doit systèmatiquement être annoté de manière claire, éducative et pédagogique. L'explication doit éclairer le "pourquoi" et la dynamique de l'architecture, et non se limiter à paraphraser la syntaxe technique.

## 2. Processus de Traitement des Demandes
1. **Analyse & Clarification** : Avant d'exécuter des requêtes à fort impact, une analyse de l'existant, y compris le croisement des schémas d'architecture (ex: documents SVG ou diagrammes de classe), est effectuée pour garantir la viabilité de l'action.
2. **Planification (Planning Mode)** : Pour toute évolution significative (refonte, modification d'architecture, réécriture), un `implementation_plan` (Plan d'Implémentation) est généré. **Aucune action irréversible ou de refonte massive n'est lancée sans la validation explicite du plan par l'utilisateur.**
3. **Découpage & Exécution** : Le travail est découpé dans un artefact temporaire (`task.md`). L'assistant fait évoluer ce document pas-à-pas lors des manipulations.
4. **Validation et Test** : Les modifications complexes impliquent des vérifications en conditions réelles (lancement de serveurs via `python -m http.server`, tests du navigateur ou demande à l'utilisateur de valider visuellement un flux).

## 3. Structure des Livrables
* **Plans d'Implémentation (`implementation_plan.md`)** : Structurés selon : Objectif -> Phase de revue exigée de l'utilisateur -> Modifications proposées -> Plan de test.
* **Édition Code (Diffs)** : Les modifications sont appliquées de manière ciblée, sans écraser entièrement les fichiers inutilement.
* **Rapports de Fin (`walkthrough.md`)** : En fin de session majeure, un résumé clair reprenant les accomplissements, l'état de l'application et les points nécessitant des tests manuels est rédigé.

## 4. Conventions de Style et de Documentation
* **Nomenclature et Architecture Modulaire** : Le système est agencé par domaines stricts (`.app`, `.modules`, `Commandes`, `Interface`, `Kernel`). Les dépendances obéissent à un arbre décisionnel strict (ex: `Commandes` -> `State` -> `StateManager` -> `EventBus`). 
* **Design System Centralisé** : Utilisation exclusive des tokens et variables issus de `design-rules.css` (couleurs, variables glassmorphism, espacements). Toute inclusion d'outils externes dérogeant à cette esthétique nécessite la validation de l'utilisateur.
* **JSDoc et Commentaires** : L'utilisation de commentaires multi-lignes clairs sur chaque classe et module principal est la norme pour assurer la continuité pédagogique du projet.

## 5. Gestion des Décisions, Changements et Retours
* **Flexibilité Face à l'Erreur** : Lors d'exceptions ou d'erreurs consoles (ex. erreurs système du robot, échecs serveurs), le contexte de l'erreur brute est remonté. L'assistant pivote et suggère de nouvelles voies à l'utilisateur si la correction logicielle automatique échoue.
* **Avertissements Visuels** : L'utilisation des bannières d'alerte (`> [!IMPORTANT]`, `> [!WARNING]`) est requise pour notifier l'utilisateur de changements cassants ou de besoins de décisions en architecture.
* **Suivi des Retours** : Les consignes exceptionnelles apportées par l'utilisateur (comme des graphes de dépendances spécifiques ou de strictes conditions d'import) priment systématiquement sur le plan d'action initial de l'assistant.
