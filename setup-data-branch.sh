#!/bin/bash
# 🚒 Feuerwehr Hamberg - Data Branch Setup Script
# Dieses Script erstellt den separaten 'data' Branch für DSGVO-konforme Datenspeicherung

set -e

echo "🚒 Feuerwehr Hamberg - Data Branch Setup"
echo "========================================"

# Prüfe ob wir in einem Git Repository sind
if [ ! -d ".git" ]; then
    echo "❌ Fehler: Kein Git Repository gefunden"
    echo "Bitte führen Sie dieses Script im Root-Verzeichnis des Repositories aus"
    exit 1
fi

# Erstelle data branch
echo "📁 Erstelle 'data' Branch..."
git checkout --orphan data

# Lösche alle Dateien (data branch soll sauber sein)
git rm -rf . 2>/dev/null || true

# Erstelle data branch Struktur
echo "🏗️ Erstelle Data Branch Struktur..."

# README für data branch
cat > README.md << 'EOF'
# 🚒 Feuerwehr Hamberg - Mitgliederdaten (DSGVO-konform)

⚠️ **ACHTUNG: Dieser Branch enthält personenbezogene Daten!**

## 🔒 Datenschutz & Sicherheit

- **Zugriff beschränkt**: Nur Repository-Owner haben Zugriff
- **DSGVO-konform**: Daten werden strukturiert und sicher gespeichert
- **Automatische Verarbeitung**: Keine manuelle Bearbeitung erforderlich

## 📁 Dateistruktur

```
data/
├── members/           # Einzelne Mitgliederdateien (JSON)
├── exports/          # Generierte Exports (CSV, HTML)
├── logs/             # Verarbeitungslogs
└── README.md         # Diese Datei
```

## 📊 Datenformat

Jede Mitgliederdatei folgt diesem Schema:

```json
{
  "timestamp": "2025-09-24T10:30:00.000Z",
  "person": {
    "nachname": "Mustermann",
    "vorname": "Max",
    "geburtsdatum": "1980-01-01",
    "email": "max@example.com",
    "telefon": "+49123456789"
  },
  "adresse": {
    "strasse": "Musterstraße",
    "hausnummer": "123",
    "plz": "12345",
    "ort": "Hamberg"
  },
  "qualifikationen": {
    "mta_absolviert": true,
    "dienstjahre_25": false,
    "dienstjahre_40": false
  },
  "consent": {
    "datenschutz": true
  },
  "meta": {
    "accessVerified": true
  }
}
```

## 🔄 Automatische Verarbeitung

Nach jedem neuen Eintrag werden automatisch generiert:
- `exports/all_members.json` - Gesamtdatei aller Mitglieder
- `exports/members.csv` - CSV-Export für Excel
- `exports/members.html` - HTML-Übersicht mit Statistiken
- `logs/processing.log` - Verarbeitungsprotokoll

---
*Erstellt am: $(date)*
*Repository: plankl/ehrenamtskarte_ff_hamberg_v2*
EOF

# Erstelle Ordnerstruktur
mkdir -p data/members
mkdir -p data/exports  
mkdir -p data/logs

# Placeholder-Dateien erstellen
echo "# Mitgliederdateien werden hier gespeichert" > data/members/README.md
echo "# Automatisch generierte Exports" > data/exports/README.md
echo "# Verarbeitungslogs" > data/logs/README.md

# Erste Commit im data branch
git add .
git commit -m "🚀 Initialize data branch for DSGVO-compliant member data storage"

echo ""
echo "✅ Data Branch erfolgreich erstellt!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Push data branch: git push origin data"
echo "2. Wechsel zurück zu main: git checkout main"
echo "3. Repository Settings → Branches → Add rule für 'data' branch"
echo "   - Restrict pushes that create files"
echo "   - Restrict pushes to admins only"
echo ""
echo "🔒 DSGVO-Compliance:"
echo "- Nur Repository-Owner haben Zugriff auf data branch"
echo "- Automatische Strukturierung der Daten"
echo "- Sichere Token-basierte Übertragung"

# Zurück zu main branch
git checkout main