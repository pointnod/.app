@echo off
TITLE .app Playground Launcher
SETLOCAL EnableDelayedExpansion

:: 1. Initialisation de l'environnement portatif
SET PROJECT_ROOT=%~dp0
SET DEV_ENV=%PROJECT_ROOT%.dev-env
SET PATH=%DEV_ENV%\node;%DEV_ENV%\git\bin;%PATH%

:: 2. Vérification des outils
echo [#] Initialisation de l'ecosysteme .app...
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [!] Node.js non trouve. Utilisation du PATH systeme par defaut.
)

:: 3. Lancement du Dashboard (GUI)
echo [#] Lancement du Tableau de Bord Glass-Tech...
:: On ouvre l'index.html racine qui sert de hub
start "" "%PROJECT_ROOT%index.html"

:: 4. Lancement optionnel du serveur de dev Web
cd "%PROJECT_ROOT%platforms\web-mobile"
echo [#] Activation du Background Engine (Vite)...
start /B npx vite --host

echo.
echo [OK] Playground pret. Utilisez le navigateur pour controler les plateformes.
echo [OK] Racine : %PROJECT_ROOT%
pause