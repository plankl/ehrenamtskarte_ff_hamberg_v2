# 🚒 Feuerwehr Hamberg - Mitgliederdatensystem (DSGVO-konform)

Ein vollständiges, sicheres Webformular zur Erfassung von Mitgliederdaten der Feuerwehr Hamberg mit automatischer GitHub-Integration und separatem Data Branch.

## ✨ Features

### 📝 Datenerfassung

- **Umfassendes Mitgliederformular** - Erfassung aller relevanten Daten
- **Intelligente Validierung** - Fehlerprüfung vor Übermittlung
- **Duplikat-Erkennung** - Verhindert Mehrfacheinträge
- **Datenvorschau** - Überprüfung vor der Übermittlung
- **Auto-Save Draft** - Lokale Zwischenspeicherung während der Eingabe

### � Datenschutz & Sicherheit

- **DSGVO-konform** - Separater privater Data Branch
- **Token-basierte Authentifizierung** - Sichere GitHub API Integration
- **Private Repository** - Nur für Administratoren zugänglich
- **Structured Logging** - Nachverfolgbare Datenverarbeitung
- **robots.txt** - Ausschluss von Suchmaschinen

### 🚀 Automation & Deployment

- **GitHub Pages Hosting** - Automatisches Deployment
- **GitHub Actions** - CI/CD Pipeline
- **Automatische Exports** - JSON, CSV, HTML Generierung
- **Branch Protection** - Data Branch nur für Admins

### � Datenverarbeitung

- **JSON Storage** - Strukturierte Einzeldateien
- **CSV Export** - Excel-kompatible Tabellen
- **HTML Dashboard** - Web-basierte Übersicht mit Statistiken
- **Processing Logs** - Automatische Protokollierung

## 🏗️ Technischer Aufbau

### Frontend

- **HTML5** - Semantisches, barrierefreies Markup
- **CSS3** - Moderne Styles mit CSS Custom Properties
- **JavaScript ES6+** - Objektorientierte Programmierung
- **Responsive Design** - Mobile-First Approach

### Backend/Integration

- **GitHub API** - Sichere Datenübertragung
- **GitHub Actions** - Automated Deployment
- **GitHub Pages** - Static Hosting
- **Personal Access Tokens** - Sichere Authentifizierung

## 🚀 Installation & Setup

### 1. Repository Setup

```bash
# Repository klonen
git clone https://github.com/DEIN_USERNAME/ff_hamberg_ehrenamtskarte_v2.git
cd ff_hamberg_ehrenamtskarte_v2

# GitHub Pages aktivieren (in Repository Settings)
# Source: GitHub Actions
```

### 2. GitHub Personal Access Token

1. Gehe zu **GitHub Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Klicke **Generate new token (classic)**
3. Name: `FF Hamberg Data Transfer`
4. Berechtigungen auswählen:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Token generieren und **sofort kopieren**

### 3. Repository Secret konfigurieren

1. Gehe zu deinem Repository → **Settings** → **Secrets and variables** → **Actions**
2. Klicke **New repository secret**
3. Name: `DATA_TRANSFER_TOKEN`
4. Value: Dein generiertes Personal Access Token
5. **Add secret**

### 4. Data Branch erstellen

```bash
# Erstelle einen separaten Branch für Daten
git checkout --orphan data
git rm -rf .
echo "# Feuerwehr Hamberg - Mitgliederdaten" > README.md
mkdir data
echo "# Mitgliederdaten werden hier gespeichert" > data/README.md
git add .
git commit -m "Initialize data branch"
git push origin data
git checkout main
```

## 📋 Verwendung

### Für Mitglieder

1. Öffne die Website: `https://DEIN_USERNAME.github.io/ff_hamberg_ehrenamtskarte_v2/`
2. Fülle das Formular vollständig aus
3. Klicke **Vorschau** zur Überprüfung (optional)
4. Klicke **Daten übermitteln**
5. Warte auf Bestätigung

### Für Administratoren

- Daten werden automatisch im `data` Branch gespeichert
- Format: `member-data-YYYY-MM-DDTHH-mm-ss-sssZ.json`
- Zugriff über GitHub Repository → Branch: `data` → Ordner: `data/`

## 🔧 Konfiguration

### Token-Konfiguration

Das System unterstützt zwei Modi:

1. **Automatisch** - Token wird über GitHub Actions injiziert
2. **Manuell** - Benutzer wird zur Token-Eingabe aufgefordert

### Anpassungen

- **Design**: Bearbeite `styles.css`
- **Formularfelder**: Bearbeite `index.html`
- **Verhalten**: Bearbeite `script.js`
- **Deployment**: Bearbeite `.github/workflows/deploy.yml`

## 📊 Datenstruktur

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "personalInfo": {
    "firstName": "Max",
    "lastName": "Mustermann",
    "birthDate": "1990-01-01",
    "email": "max@example.com",
    "phone": "0123-456789"
  },
  "address": {
    "street": "Musterstraße 123",
    "zipCode": "12345",
    "city": "Hamberg"
  },
  "firefighterInfo": {
    "membershipType": "active",
    "joinDate": "2020-01-01",
    "functions": "Gruppenführer, Atemschutzgeräteträger"
  },
  "additionalInfo": {
    "emergencyContact": "Maria Mustermann, 0987-654321",
    "notes": "Besondere Qualifikationen oder Anmerkungen"
  },
  "consent": {
    "dataProtection": true
  }
}
```

## 🔒 Sicherheit & Datenschutz

- ✅ **HTTPS-Übertragung** - Sichere Datenübertragung
- ✅ **Token-basierte Auth** - Keine Passwörter im Code
- ✅ **Lokale Zwischenspeicherung** - Daten bleiben im Browser
- ✅ **Einverständniserklärung** - DSGVO-konform
- ✅ **Strukturierte Speicherung** - Saubere Datentrennung

## 🚨 Troubleshooting

### Token-Probleme

```
❌ No valid token found. Current token: GITHUB_TOKEN_PLACEHOLDER
```

**Lösung**: DATA_TRANSFER_TOKEN Secret konfigurieren (siehe Setup)

### Deployment-Fehler

```
Context access might be invalid: DATA_TRANSFER_TOKEN
```

**Lösung**: Normal - Secret wird zur Laufzeit verfügbar

### Formular funktioniert nicht

1. Browser-Konsole öffnen (F12)
2. Fehler überprüfen
3. Cache leeren (Ctrl+Shift+R)

## 📞 Support

Bei Problemen oder Fragen:

1. **Issues** im GitHub Repository erstellen
2. **Logs** aus Browser-Konsole beifügen
3. **Screenshots** bei UI-Problemen

## 📜 Lizenz

Dieses Projekt ist für die Feuerwehr Hamberg entwickelt.
© 2024 Feuerwehr Hamberg - Alle Rechte vorbehalten.

---

**🚒 Für die Sicherheit unserer Gemeinschaft - Feuerwehr Hamberg**
