#!/bin/bash
# 🚒 Feuerwehr Hamberg - Automatische Datenverarbeitung
# Generiert Exports und Statistiken aus den Mitgliederdaten

set -e

echo "🚒 Feuerwehr Hamberg - Datenverarbeitung"
echo "========================================"

# Wechsel zum data branch
git checkout data 2>/dev/null || {
    echo "❌ Data branch nicht gefunden. Bitte zuerst './setup-data-branch.sh' ausführen."
    exit 1
}

# Erstelle Arbeitsverzeichnis
mkdir -p data/exports
cd data

echo "📊 Verarbeite Mitgliederdaten..."

# Sammle alle JSON-Dateien
MEMBER_FILES=$(find members -name "*.json" 2>/dev/null | wc -l)
echo "📁 Gefundene Mitgliederdateien: $MEMBER_FILES"

if [ "$MEMBER_FILES" -eq 0 ]; then
    echo "ℹ️ Noch keine Mitgliederdaten vorhanden."
    exit 0
fi

# Generiere all_members.json
echo "🔄 Generiere all_members.json..."
echo "[" > exports/all_members.json
FIRST=true
for file in members/*.json; do
    if [ "$FIRST" = true ]; then
        FIRST=false
    else
        echo "," >> exports/all_members.json
    fi
    cat "$file" >> exports/all_members.json
done
echo "]" >> exports/all_members.json

# Generiere CSV
echo "📋 Generiere members.csv..."
echo "Nachname,Vorname,Geburtsdatum,E-Mail,Telefon,Straße,Hausnummer,PLZ,Ort,MTA,25Jahre,40Jahre,Timestamp" > exports/members.csv

for file in members/*.json; do
    python3 -c "
import json, sys
with open('$file', 'r', encoding='utf-8') as f:
    data = json.load(f)
    p = data['person']
    a = data['adresse']
    q = data['qualifikationen']
    print(f\"{p['nachname']},{p['vorname']},{p['geburtsdatum']},{p['email']},{p['telefon']},{a['strasse']},{a['hausnummer']},{a['plz']},{a['ort']},{q['mta_absolviert']},{q['dienstjahre_25']},{q['dienstjahre_40']},{data['timestamp']}\")
" >> exports/members.csv 2>/dev/null || {
    # Fallback für Systeme ohne Python
    echo "⚠️ Python nicht verfügbar - CSV-Export übersprungen"
}
done

# Generiere HTML-Übersicht
echo "🌐 Generiere members.html..."
cat > exports/members.html << 'EOF'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚒 Feuerwehr Hamberg - Mitgliederübersicht</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #c41e3a; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #c41e3a; color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; }
        .stat-label { margin-top: 5px; }
        .members-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .members-table th, .members-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .members-table th { background: #c41e3a; color: white; }
        .members-table tr:hover { background: #f5f5f5; }
        .qualification { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; margin: 2px; }
        .qual-mta { background: #28a745; color: white; }
        .qual-25 { background: #ffc107; color: black; }
        .qual-40 { background: #dc3545; color: white; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        @media (max-width: 768px) {
            .members-table { font-size: 0.8em; }
            .members-table th, .members-table td { padding: 8px 4px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚒 Feuerwehr Hamberg</h1>
            <h2>Mitgliederübersicht & Statistiken</h2>
            <p>Generiert am: <strong>$(date '+%d.%m.%Y um %H:%M Uhr')</strong></p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">$MEMBER_FILES</div>
                <div class="stat-label">Registrierte Mitglieder</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(grep -o "mta_absolviert.*true" members/*.json 2>/dev/null | wc -l)</div>
                <div class="stat-label">MTA absolviert</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(grep -o "dienstjahre_25.*true" members/*.json 2>/dev/null | wc -l)</div>
                <div class="stat-label">25+ Jahre Dienst</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(grep -o "dienstjahre_40.*true" members/*.json 2>/dev/null | wc -l)</div>
                <div class="stat-label">40+ Jahre Dienst</div>
            </div>
        </div>

        <h3>📋 Mitgliederliste</h3>
        <table class="members-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>E-Mail</th>
                    <th>Ort</th>
                    <th>Qualifikationen</th>
                    <th>Registriert</th>
                </tr>
            </thead>
            <tbody>
EOF

# Füge Mitgliederdaten zur HTML-Tabelle hinzu
for file in members/*.json; do
    if [ -f "$file" ]; then
        python3 -c "
import json, datetime
with open('$file', 'r', encoding='utf-8') as f:
    data = json.load(f)
    p = data['person']
    a = data['adresse']
    q = data['qualifikationen']
    ts = datetime.datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00')).strftime('%d.%m.%Y')
    
    quals = []
    if q['mta_absolviert']: quals.append('<span class=\"qualification qual-mta\">MTA</span>')
    if q['dienstjahre_25']: quals.append('<span class=\"qualification qual-25\">25J</span>')
    if q['dienstjahre_40']: quals.append('<span class=\"qualification qual-40\">40J</span>')
    quals_str = ''.join(quals) if quals else '<em>Keine</em>'
    
    print(f'''<tr>
        <td><strong>{p['vorname']} {p['nachname']}</strong></td>
        <td>{p['email']}</td>
        <td>{a['ort']}</td>
        <td>{quals_str}</td>
        <td>{ts}</td>
    </tr>''')
" >> exports/members.html 2>/dev/null || {
    echo "<tr><td colspan='5'>Fehler beim Laden der Daten</td></tr>" >> exports/members.html
}
    fi
done

# HTML-Footer
cat >> exports/members.html << 'EOF'
            </tbody>
        </table>

        <div class="footer">
            <p>🔒 <strong>Datenschutz:</strong> Diese Daten sind nur für autorisierte Feuerwehr-Mitglieder bestimmt.</p>
            <p>📊 Automatisch generiert durch das Feuerwehr Hamberg Datenverwaltungssystem</p>
            <p>🚒 Repository: plankl/ehrenamtskarte_ff_hamberg_v2</p>
        </div>
    </div>
</body>
</html>
EOF

# Aktualisiere Processing Log
echo "📝 Aktualisiere Logs..."
cat >> logs/processing-$(date +%Y-%m-%d).log << EOF
$(date -Iseconds): EXPORT_GENERATED - Members: $MEMBER_FILES, All: $(ls exports/ | wc -l) files
EOF

echo ""
echo "✅ Datenverarbeitung abgeschlossen!"
echo ""
echo "📊 Generierte Dateien:"
echo "   - exports/all_members.json ($(wc -l < exports/all_members.json) Zeilen)"
echo "   - exports/members.csv ($(wc -l < exports/members.csv) Einträge)"
echo "   - exports/members.html (Web-Übersicht)"
echo ""
echo "🔄 Änderungen committen:"
echo "   git add exports/ logs/"
echo "   git commit -m '📊 Update exports: $MEMBER_FILES members'"
echo "   git push origin data"

# Zurück zu main branch
git checkout main