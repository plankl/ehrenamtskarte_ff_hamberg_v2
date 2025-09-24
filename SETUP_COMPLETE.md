# 🚒 Feuerwehr Hamberg - Komplettes Setup

Schritt-für-Schritt Anleitung zur Einrichtung Ihres vollständigen GitHub-basierten Datenverwaltungstools.

## 🏗️ Setup-Schritte

### 1. Repository in GitHub erstellen/konfigurieren

```bash
# Falls noch nicht geschehen - Repository erstellen
# Repository Name: ehrenamtskarte_ff_hamberg_v2
# Owner: plankl
# Visibility: Private (für DSGVO-Compliance)
```

### 2. Data Branch erstellen

```bash
# In Ihrem lokalen Repository:
chmod +x setup-data-branch.sh
./setup-data-branch.sh

# Oder manuell:
git checkout --orphan data
git rm -rf .
echo "# Feuerwehr Hamberg - Mitgliederdaten" > README.md
mkdir -p data/members data/exports data/logs
git add .
git commit -m "🚀 Initialize data branch"
git push origin data
git checkout main
```

### 3. GitHub Personal Access Token erstellen

1. **GitHub Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. **Name**: `FF Hamberg Data Transfer`
4. **Expiration**: 1 year (oder nach Bedarf)
5. **Scopes auswählen**:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. **Generate token** und **sofort kopieren**! ⚠️

### 4. Repository Secrets konfigurieren

1. **Repository** → **Settings** → **Secrets and variables** → **Actions**

2. **Erstes Secret - GitHub Token**:

   - **New repository secret**
   - **Name**: `DATA_TRANSFER_TOKEN`
   - **Value**: Ihr Personal Access Token
   - **Add secret**

3. **Zweites Secret - Feuerwehr Passwort**:
   - **New repository secret**
   - **Name**: `FEUERWEHR_ACCESS_PASSWORD`
   - **Value**: Das geheime Passwort für Feuerwehr-Mitglieder
   - **Add secret**

💡 **Tipp**: Wählen Sie ein sicheres Passwort, das Sie an alle berechtigten Feuerwehr-Mitglieder weitergeben können.

### 5. GitHub Pages aktivieren

1. **Repository** → **Settings** → **Pages**
2. **Source**: `GitHub Actions`
3. **Save**

### 6. Branch Protection für Data Branch

1. **Repository** → **Settings** → **Branches**
2. **Add rule**:
   - **Branch name pattern**: `data`
   - ✅ **Restrict pushes that create files**
   - ✅ **Restrict pushes to admins**
   - ✅ **Include administrators**

## 🚀 Deployment

### Automatisches Deployment

```bash
# Änderungen pushen löst automatisches Deployment aus
git add .
git commit -m "🚒 Setup complete"
git push origin main
```

### Manuelle Trigger

1. **Repository** → **Actions** → **Deploy Feuerwehr Hamberg System**
2. **Run workflow** → **Run workflow**

## 🌐 Zugriff auf das System

Nach erfolgreichem Deployment:

- **Website**: `https://plankl.github.io/ehrenamtskarte_ff_hamberg_v2/`
- **Daten**: `https://github.com/plankl/ehrenamtskarte_ff_hamberg_v2/tree/data`

## 🔒 DSGVO-Compliance Features

### Datenschutz

- ✅ **Private Repository**: Nur Sie haben Zugriff
- ✅ **Separater Data Branch**: Daten isoliert vom Code
- ✅ **Token-basierte Authentifizierung**: Sichere Übertragung
- ✅ **robots.txt**: Suchmaschinen-Ausschluss
- ✅ **Structured Logging**: Nachverfolgbare Verarbeitung

### Datenorganisation

```
data/
├── members/                    # Einzelne Mitgliederdateien
│   ├── member-Mustermann-Max-2025-09-24T10-30-00-000Z.json
│   └── member-Schmidt-Anna-2025-09-24T11-15-00-000Z.json
├── exports/                    # Automatische Exports
│   ├── all_members.json       # Gesamtdatei
│   ├── members.csv            # Excel-kompatibel
│   └── members.html           # Web-Übersicht
└── logs/                       # Verarbeitungslogs
    └── processing-2025-09-24.log
```

## 🛠️ Verwendung

### Für Mitglieder

1. Website öffnen: `https://plankl.github.io/ehrenamtskarte_ff_hamberg_v2/`
2. Formular ausfüllen
3. Daten überprüfen (Vorschau)
4. Absenden
5. Bestätigung erhalten

### Für Sie als Administrator

1. **Neue Daten**: GitHub → Repository → Branch: `data` → `data/members/`
2. **Gesamtübersicht**: `data/exports/` (wenn Auto-Export implementiert)
3. **Logs**: `data/logs/` für Nachverfolgung

## 🔧 Anpassungen

### Token-Konfiguration

- Token wird beim ersten Aufruf vom User abgefragt
- Sicher in Browser-Session gespeichert
- Keine Speicherung im Code

### Formular erweitern

- Neue Felder in `index.html` hinzufügen
- Entsprechende Validierung in `script.js`
- Datenstruktur in `collectFormData()` erweitern

## 📊 Monitoring

### Erfolgreiche Einträge prüfen

```bash
# Anzahl Einträge
git checkout data
ls data/members/ | wc -l

# Neueste Einträge
ls -la data/members/ | tail -5
```

### Logs prüfen

```bash
# Aktuelle Logs
cat data/logs/processing-$(date +%Y-%m-%d).log
```

## 🆘 Troubleshooting

### Häufige Probleme

1. **"GitHub token not configured"**

   - Prüfen: Repository Secrets → `DATA_TRANSFER_TOKEN`
   - User wird beim ersten Aufruf nach Token gefragt

2. **"Branch 'data' not found"**

   - Data Branch erstellen: `./setup-data-branch.sh`

3. **GitHub Pages nicht erreichbar**

   - Repository Settings → Pages → Source: GitHub Actions
   - Warten auf Deployment (5-10 Minuten)

4. **Formular sendet nicht**
   - Browser-Konsole prüfen (F12)
   - Token-Berechtigung prüfen

### Support

- **GitHub Actions Logs**: Repository → Actions → Fehlgeschlagene Workflows
- **Browser-Konsole**: F12 → Console → Fehlermeldungen
- **Repository Issues**: Bei technischen Problemen

---

## ✅ Checkliste

- [ ] Repository ist private
- [ ] Data Branch erstellt
- [ ] Personal Access Token generiert
- [ ] Repository Secret `DATA_TRANSFER_TOKEN` gesetzt
- [ ] Repository Secret `FEUERWEHR_ACCESS_PASSWORD` gesetzt
- [ ] GitHub Pages aktiviert (Source: GitHub Actions)
- [ ] Branch Protection für `data` aktiviert
- [ ] Erstes Deployment erfolgreich
- [ ] Website erreichbar
- [ ] Feuerwehr-Passwort funktioniert
- [ ] Testformular ausgefüllt und gesendet
- [ ] Daten im `data` Branch angekommen

**🎉 Ihr System ist jetzt vollständig einsatzbereit!**
