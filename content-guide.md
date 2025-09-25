# 🚒 Feuerwehr Hamberg - Ehrenamtskarte Content

> Diese Datei dient als Referenz. Der eigentliche Inhalt wird über `content.json` gesteuert.

## 📝 Bearbeitungsanleitung

Um den Inhalt der Website zu ändern:

1. **Einfache Textänderungen:** Bearbeite die `content.json` Datei
2. **Strukturelle Änderungen:** Nutze diese Markdown-Datei als Referenz
3. **Nach Änderungen:** Seite neu laden - Änderungen werden automatisch übernommen

---

## 🎯 Hero-Bereich

**Haupttitel:** Feuerwehr Hamberg  
**Untertitel:** Ehrenamtskarte Registrierung

**Badges:**

- 👥 500+ Aktive
- ⏰ 24/7 Bereit
- 🎖️ Ehrenamt

---

## ℹ️ Informationsseite Inhalte

### 🎫 Was ist die Ehrenamtskarte?

Die Ehrenamtskarte ist eine Anerkennungsform für Menschen, die sich ehrenamtlich engagieren und damit einen wichtigen Beitrag für das Gemeinwohl leisten. Sie würdigt das freiwillige Engagement und bietet als Dankeschön verschiedene Vergünstigungen und Vorteile.

### ✅ Voraussetzungen für Feuerwehren

Für Angehörige der Freiwilligen Feuerwehr gelten folgende Voraussetzungen:

- **Blaue Ehrenamtskarte:** Aktiver Dienst in der Freiwilligen Feuerwehr mit abgeschlossener Modularer Truppausbildung (MTA)
- **Goldene Ehrenamtskarte:** Feuerwehrdienst mit Dienstzeitauszeichnung nach 25 Jahren aktiver Tätigkeit oder 40 Jahre Dienst
- Mindestens 16 Jahre alt
- Wohnsitz in Bayern
- Aufwandsentschädigungen dürfen 840€ (Ehrenamtspauschale) pro Jahr nicht übersteigen

### 🎁 Vorteile in Bayern

Mit der Ehrenamtskarte erhalten Sie zahlreiche Vergünstigungen:

- Vergünstigungen bei staatlichen Einrichtungen (Museen, Burgen, Schlösser)
- Rabatte bei über 1.000 regionalen Partnern bayernweit
- Kostenlose App "Ehrenamtskarte Bayern" mit aktuellen Angeboten
- Spezielle Verlosungen und Aktionen nur für Karteninhaber
- Vergünstigungen bei Freizeitparks und Kulturveranstaltungen
- Reduzierte Eintrittspreise bei vielen Veranstaltungen

### 🔒 Datenschutz & Sicherheit

Ihre persönlichen Daten werden selbstverständlich gemäß der Datenschutz-Grundverordnung (DSGVO) verarbeitet und nur für die Beantragung der Ehrenamtskarte verwendet. Eine Weitergabe an Dritte erfolgt nicht. Alle Daten werden verschlüsselt übertragen und sicher gespeichert.

### 📋 Beantragung & Bearbeitung

Die über diese Website erfassten Daten werden direkt an das **Landratsamt Neumarkt i.d.OPf.** übermittelt, welches für die Ausstellung der Ehrenamtskarten zuständig ist. Die Bearbeitung und Prüfung Ihres Antrags erfolgt dort in der Regel innerhalb von **4-6 Wochen**. Sie erhalten die Karte dann direkt per Post zugesandt.

### 💬 Kontakt & Zuständigkeit

Bei Fragen stehen Ihnen folgende Ansprechpartner zur Verfügung:

#### Feuerwehr Hamberg

Bei Fragen zur Anmeldung und zu den Voraussetzungen wenden Sie sich an:

- 📧 **E-Mail:** feuerwehr@hamberg.de
- 📞 **Telefon:** 09181 123456
- 🏠 **Feuerwehrhaus:** Hauptstraße 12, 92318 Hamberg

#### Landratsamt Neumarkt i.d.OPf.

Für die Bearbeitung der Anträge zuständig:

- 📍 **Adresse:** Nürnberger Straße 1, 92318 Neumarkt i.d.OPf.
- 📞 **Telefon:** 09181 470-0
- 🌐 **Web:** www.landkreis-neumarkt.de
- 📧 **E-Mail:** info@landkreis-neumarkt.de

---

## 📝 Formular-Abschnitte

### 👤 Persönliche Daten

_Ihre grundlegenden Informationen_

### 🏠 Adresse

_Ihre aktuelle Wohnadresse_

### 🎖️ Qualifikationen

_Ihre Berechtigung für die Ehrenamtskarte_

**Wichtiger Hinweis:** Sie müssen mindestens eine der folgenden Qualifikationen erfüllen, um berechtigt zu sein. Die goldene Ehrenamtskarte erhalten Sie bei 25+ oder 40+ Jahren Dienst.

### 🔐 Sicherheit

_Passwort zur Übermittlung Ihrer Daten_

---

## 🛠️ Technische Hinweise

### JSON-Struktur verstehen

Die `content.json` ist wie folgt aufgebaut:

```json
{
  "meta": { ... },           // Seitentitel, Beschreibung
  "hero": { ... },           // Hauptbereich oben
  "tabs": { ... },           // Tab-Beschriftungen
  "info_page": { ... },      // Gesamter Info-Bereich
  "form": { ... },           // Formular-Beschriftungen
  "footer": { ... }          // Fußbereich
}
```

### Textformatierung

In der JSON kannst du folgende Formatierungen verwenden:

- `**fett**` für **fette Schrift**
- `*kursiv*` für _kursive Schrift_
- `\n` für Zeilenumbrüche

### Kartentypen

Die Info-Karten unterstützen drei Typen:

1. **text:** Einfacher Text mit Formatierung
2. **list:** Text mit Aufzählungsliste
3. **contact:** Spezielle Kontakt-Information

---

## 🚀 Änderungen vornehmen

1. **Öffne** `content.json` in einem Texteditor
2. **Ändere** die gewünschten Texte
3. **Speichere** die Datei
4. **Lade** die Website neu - Änderungen sind sofort sichtbar!

### Beispiel für eine Textänderung:

```json
{
  "info_page": {
    "cards": [
      {
        "icon": "🎫",
        "title": "DEIN NEUER TITEL",
        "content": "Dein neuer Text hier...",
        "type": "text"
      }
    ]
  }
}
```

---

_Letzte Aktualisierung: 25.09.2025_
