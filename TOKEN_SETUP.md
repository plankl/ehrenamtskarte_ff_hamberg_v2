# 🔐 GitHub Token Setup - Anleitung

## Schritt-für-Schritt Anleitung für DATA_TRANSFER_TOKEN

### 1. GitHub Personal Access Token erstellen

1. **Gehe zu GitHub.com** und logge dich ein
2. **Klicke auf dein Profilbild** (oben rechts) → **Settings**
3. **Scrolle nach unten** → **Developer settings** (linke Seitenleiste)
4. **Personal access tokens** → **Tokens (classic)**
5. **Generate new token** → **Generate new token (classic)**

### 2. Token konfigurieren

**Name des Tokens:**

```
FF Hamberg Data Transfer
```

**Expiration:**

- Wähle `90 days` oder `1 year` (je nach Bedarf)

**Scopes auswählen:**

- ✅ `repo` (Full control of private repositories)
  - Ermöglicht das Schreiben in dein Repository
- ✅ `workflow` (Update GitHub Action workflows)
  - Ermöglicht Workflow-Ausführung

### 3. Token kopieren und sicher aufbewahren

⚠️ **WICHTIG**: Das Token wird nur EINMAL angezeigt!

- Kopiere es sofort in die Zwischenablage
- Speichere es temporär in einer sicheren Notiz

### 4. Repository Secret erstellen

1. **Gehe zu deinem Repository** `ff_hamberg_ehrenamtskarte_v2`
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
4. **Name:** `DATA_TRANSFER_TOKEN`
5. **Secret:** Füge dein kopiertes Token ein
6. **Add secret**

### 5. Workflow testen

Nach dem Setup:

1. Mache einen kleinen commit (z.B. README bearbeiten)
2. Push den commit: `git push`
3. Gehe zu **Actions** Tab im Repository
4. Schaue ob der "Deploy Website" Workflow erfolgreich läuft

### 6. Website testen

1. Öffne `https://DEIN_USERNAME.github.io/ff_hamberg_ehrenamtskarte_v2/`
2. Öffne Browser-Konsole (F12)
3. Du solltest sehen:
   ```
   ✅ GitHub token configured successfully
   ```

## 🔍 Troubleshooting

### Token wird nicht erkannt

**Problem:** Website zeigt immer noch "Token not configured"
**Lösung:**

1. Überprüfe Secret Name: Muss exakt `DATA_TRANSFER_TOKEN` heißen
2. Warte 5-10 Minuten nach Token-Erstellung
3. Mache einen neuen commit um Deployment zu triggern

### Workflow-Fehler

**Problem:** GitHub Actions schlägt fehl
**Lösung:**

1. Gehe zu Actions → Klicke auf fehlgeschlagenen Run
2. Schaue dir die Logs an
3. Überprüfe ob Token korrekt konfiguriert ist

### Token abgelaufen

**Problem:** Nach einiger Zeit funktioniert es nicht mehr
**Lösung:**

1. Erstelle ein neues Token (siehe Schritt 1-2)
2. Ersetze das alte Secret mit dem neuen Token (Schritt 4)

## 📋 Checklist

- [ ] GitHub Personal Access Token erstellt
- [ ] Token mit `repo` und `workflow` Scopes
- [ ] Repository Secret `DATA_TRANSFER_TOKEN` erstellt
- [ ] Workflow erfolgreich ausgeführt
- [ ] Website zeigt "Token configured successfully"
- [ ] Testformular funktioniert

## 🆘 Hilfe benötigt?

Falls Probleme auftreten:

1. Screenshots der Fehlermeldungen machen
2. Browser-Konsole Logs kopieren
3. GitHub Actions Logs überprüfen
4. Issue im Repository erstellen mit allen Informationen

---

**🚒 Viel Erfolg beim Setup! - Feuerwehr Hamberg**
