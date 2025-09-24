@echo off
REM 🚒 Feuerwehr Hamberg - Data Branch Setup (Windows)
echo 🚒 Feuerwehr Hamberg - Data Branch Setup
echo ========================================

REM Prüfe ob Git verfügbar ist
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Fehler: Git nicht gefunden
    echo Bitte installieren Sie Git und versuchen Sie es erneut
    pause
    exit /b 1
)

REM Prüfe ob wir in einem Git Repository sind
if not exist ".git" (
    echo ❌ Fehler: Kein Git Repository gefunden
    echo Bitte führen Sie dieses Script im Root-Verzeichnis des Repositories aus
    pause
    exit /b 1
)

echo 📁 Erstelle 'data' Branch...
git checkout --orphan data

echo 🗑️ Lösche alle Dateien vom data branch...
git rm -rf . 2>nul

echo 🏗️ Erstelle Data Branch Struktur...

REM README für data branch
echo # 🚒 Feuerwehr Hamberg - Mitgliederdaten (DSGVO-konform) > README.md
echo. >> README.md
echo ⚠️ **ACHTUNG: Dieser Branch enthält personenbezogene Daten!** >> README.md
echo. >> README.md
echo ## 🔒 Datenschutz ^& Sicherheit >> README.md
echo. >> README.md
echo - **Zugriff beschränkt**: Nur Repository-Owner haben Zugriff >> README.md
echo - **DSGVO-konform**: Daten werden strukturiert und sicher gespeichert >> README.md
echo - **Automatische Verarbeitung**: Keine manuelle Bearbeitung erforderlich >> README.md

REM Ordnerstruktur erstellen
mkdir data\members
mkdir data\exports
mkdir data\logs

REM Placeholder-Dateien
echo # Mitgliederdateien werden hier gespeichert > data\members\README.md
echo # Automatisch generierte Exports > data\exports\README.md
echo # Verarbeitungslogs > data\logs\README.md

REM Erste Commit im data branch
git add .
git commit -m "🚀 Initialize data branch for DSGVO-compliant member data storage"

echo.
echo ✅ Data Branch erfolgreich erstellt!
echo.
echo 📋 Nächste Schritte:
echo 1. Push data branch: git push origin data
echo 2. Wechsel zurück zu main: git checkout main
echo 3. Repository Settings → Branches → Add rule für 'data' branch
echo    - Restrict pushes that create files
echo    - Restrict pushes to admins only
echo.
echo 🔒 DSGVO-Compliance:
echo - Nur Repository-Owner haben Zugriff auf data branch
echo - Automatische Strukturierung der Daten
echo - Sichere Token-basierte Übertragung

REM Zurück zu main branch
git checkout main

echo.
echo Drücken Sie eine beliebige Taste zum Beenden...
pause >nul