@echo off
title Shu-no Development Server
color 0a

echo =============================================
echo    SHU-NO DEVELOPMENT SERVER LAUNCHER
echo =============================================
echo.

REM Arrêter tous les processus Node.js existants
echo [1/6] Arrêt des processus Node.js existants...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Vérifier la disponibilité des ports
echo [2/6] Vérification de la disponibilité des ports...

REM Vérifier le port 3002 (Backend)
netstat -ano | findstr ":3002" >nul
if %errorlevel% == 0 (
    echo ERREUR: Le port 3002 est déjà utilisé!
    echo Tentative de libération du port...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002"') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
) else (
    echo ✓ Port 3002 disponible
)

REM Vérifier le port 8080 (Frontend)
netstat -ano | findstr ":8080" >nul
if %errorlevel% == 0 (
    echo ERREUR: Le port 8080 est déjà utilisé!
    echo Tentative de libération du port...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
) else (
    echo ✓ Port 8080 disponible
)

echo.

REM Démarrage du serveur Backend
echo [3/6] Démarrage du serveur Backend (API)...
cd /d "c:\Users\aurel\Desktop\LiberKey\LiberKey\MyApps\laragon\www\Shu-no\backend"
start /B "Backend Server" cmd /c "npm run dev"
echo ✓ Backend démarré sur le port 3002

echo.

REM Attendre que le backend soit prêt
echo [4/6] Attente du démarrage du Backend...
timeout /t 5 /nobreak >nul

REM Démarrage du serveur Frontend
echo [5/6] Démarrage du serveur Frontend (React)...
cd /d "c:\Users\aurel\Desktop\LiberKey\LiberKey\MyApps\laragon\www\Shu-no"
start /B "Frontend Server" cmd /c "npm run dev"
echo ✓ Frontend démarré sur le port 8080

echo.

REM Attendre que le frontend soit prêt
echo [6/6] Attente du démarrage du Frontend...
timeout /t 8 /nobreak >nul

echo.
echo =============================================
echo    SERVEURS DÉMARRÉS AVEC SUCCÈS !
echo =============================================
echo.
echo 🌐 Frontend:  http://localhost:8080
echo 🔧 Backend:   http://localhost:3002
echo 👤 Admin:     http://localhost:8080/admin/login
echo 💾 API Docs:  http://localhost:3002/api/health
echo.
echo =============================================

REM Ouverture automatique de la page web
echo Ouverture de l'application dans le navigateur...
timeout /t 2 /nobreak >nul
start http://localhost:8080

echo.
echo ✨ Application prête à l'utilisation !
echo.
echo IMPORTANT:
echo - Pour arrêter les serveurs: Fermez cette fenêtre ou appuyez sur Ctrl+C
echo - En cas de problème: Relancez ce script
echo.
echo =============================================
echo Appuyez sur une touche pour arrêter les serveurs...
pause >nul

REM Nettoyage à la fermeture
echo.
echo Arrêt des serveurs en cours...
taskkill /F /IM node.exe >nul 2>&1
echo Serveurs arrêtés.
timeout /t 2 /nobreak >nul
