/**
 * 📝 Simple Markdown Content Manager - Robust & Clean Implementation
 * Lädt:
 *  - content.md  (Info-Tabs → Karten)
 *  - registration.md (Hero, Badges, Formular-Texte)
 *
 * Ziele:
 *  - Kein Framework, nur Vanilla JS
 *  - Robust bei fehlenden Dateien (Seite funktioniert weiter)
 *  - Einfache Erweiterbarkeit (Mapping + Normalisierung)
 */

class SimpleMarkdownManager {
    constructor() {
        this.infoContent = null;
        this.registrationContent = null;
        this.isLoaded = false;
        this.sections = [];
        this.init();
    }

    async init() {
        try {
            await this.loadAllContent();
            this.parseInfoContent();
            this.parseRegistrationContent();
            this.renderInfoCards();
            this.updateRegistrationContent();
            console.log('✅ Simple Markdown Manager initialized successfully');
        } catch (error) {
            console.warn('⚠️ Markdown content not available, using fallback', error);
            // Fallback: Website works with existing hardcoded content
        }
    }

    async loadAllContent() {
        try {
            // Load both markdown files in parallel
            const [infoResponse, registrationResponse] = await Promise.all([
                fetch('./content.md'),
                fetch('./registration.md')
            ]);

            if (infoResponse.ok) {
                this.infoContent = await infoResponse.text();
                console.log('📄 content.md loaded successfully');
            }

            if (registrationResponse.ok) {
                this.registrationContent = await registrationResponse.text();
                console.log('📄 registration.md loaded successfully');
            }

            this.isLoaded = true;
        } catch (error) {
            console.warn('⚠️ Error loading markdown files:', error);
            throw error;
        }
    }

    parseInfoContent() {
        if (!this.infoContent) return;

        const lines = this.infoContent.split('\n');
        let currentSection = null;
        let currentContent = [];

        for (const line of lines) {
            // Main headers (##) become info cards
            if (line.startsWith('## ')) {
                // Save previous section
                if (currentSection) {
                    this.sections.push({
                        title: currentSection,
                        content: currentContent.join('\n').trim(),
                        icon: this.getIconForSection(currentSection)
                    });
                }
                
                // Start new section
                currentSection = line.replace('## ', '').trim();
                currentContent = [];
            }
            // Skip main title (#) and separators (---)
            else if (line.startsWith('# ') || line.trim() === '---') {
                continue;
            }
            // Collect content
            else {
                currentContent.push(line);
            }
        }

        // Add last section
        if (currentSection) {
            this.sections.push({
                title: currentSection,
                content: currentContent.join('\n').trim(),
                icon: this.getIconForSection(currentSection)
            });
        }

        console.log(`📋 Parsed ${this.sections.length} info sections from markdown`);
    }

    parseRegistrationContent() {
        if (!this.registrationContent) return;

        // Kanonische interne Schlüssel
        const sectionAliases = {
            'hero bereich': 'hero',
            'hero section': 'hero',
            'formular abschnitte': 'form',
            'formular': 'form',
            'submit button': 'submit',
            'absenden': 'submit'
        };

        const normalize = (s) => (s || '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();

        this.registrationData = { hero: {}, form: { sections: [] }, submit: {} };

        const lines = this.registrationContent.split('\n');
        let currentSection = null;   // hero | form | submit
        let currentSubsection = null; // aktueller Formular-Abschnitt

        for (let rawLine of lines) {
            const line = rawLine.trimEnd();
            if (!line) continue;

            // Abschnittsebene (## ...)
            if (line.startsWith('## ')) {
                const original = line.replace('## ', '').trim();
                const key = sectionAliases[normalize(original)] || normalize(original);
                currentSection = key;
                if (key === 'form' && !this.registrationData.form.sections) {
                    this.registrationData.form.sections = [];
                }
                currentSubsection = null;
                continue;
            }

            // Formular-Unterabschnitte (### ...)
            if (line.startsWith('### ') && currentSection === 'form') {
                const subsectionTitle = line.replace('### ', '').trim();
                currentSubsection = {
                    rawTitle: subsectionTitle,
                    data: {}
                };
                this.registrationData.form.sections.push(currentSubsection);
                continue;
            }

            // Key-Value Zeilen (**Key:** Value)
            if (line.startsWith('**') && line.includes(':**')) {
                const [kPart, vPart] = line.split(':**');
                const rawKey = kPart.replace(/\*/g, '').trim();
                const value = (vPart || '').trim();

                if (currentSection === 'hero') {
                    this.registrationData.hero[rawKey] = value;
                } else if (currentSection === 'submit') {
                    this.registrationData.submit[rawKey] = value;
                } else if (currentSection === 'form') {
                    if (currentSubsection) {
                        currentSubsection.data[rawKey] = value;
                    }
                }
                continue;
            }

            // Hinweis-Zeile
            if (line.includes('**Wichtiger Hinweis:**')) {
                const note = line.replace('**Wichtiger Hinweis:**', '').trim();
                if (currentSection === 'form') {
                    this.registrationData.form.note = note;
                } else {
                    this.registrationData.note = note;
                }
            }
        }

        console.log('📝 Registration content parsed (normalized):', this.registrationData);
    }

    updateRegistrationContent() {
        if (!this.registrationData) return;

        const { hero, form, submit } = this.registrationData;

        // HERO -------------------------------------------------
        if (hero) {
            const titlePrimary = document.querySelector('.title-primary');
            const titleSecondary = document.querySelector('.title-secondary');
            const subtitleP = document.querySelector('.hero-subtitle');

            if (hero['Titel'] && titlePrimary) titlePrimary.textContent = hero['Titel'];
            if (hero['Untertitel']) {
                // Falls sekundäre Zeile gewünscht → zweite Zeile des H1
                if (titleSecondary) titleSecondary.textContent = hero['Untertitel'];
                else if (subtitleP) subtitleP.textContent = hero['Untertitel'];
            }

            // Badges (Badge 1..3)
            const badgeTexts = document.querySelectorAll('.hero-badges .badge-item .badge-text');
            ['Badge 1','Badge 2','Badge 3'].forEach((k, idx) => {
                if (hero[k] && badgeTexts[idx]) badgeTexts[idx].textContent = hero[k];
            });
        }

        // FORM ABSCHNITTE -------------------------------------
        if (form && Array.isArray(form.sections) && form.sections.length) {
            const sectionEls = document.querySelectorAll('.form-section');
            form.sections.forEach((secObj, idx) => {
                const el = sectionEls[idx];
                if (!el) return;
                const h3 = el.querySelector('h3');
                const subtitle = el.querySelector('.section-subtitle');

                const titel = secObj.data['Titel'];
                const beschr = secObj.data['Beschreibung'];
                if (titel && h3) {
                    // Behalte Icon-Span falls vorhanden
                    const iconSpan = h3.querySelector('.section-icon');
                    if (iconSpan) {
                        h3.innerHTML = '';
                        h3.appendChild(iconSpan);
                        h3.appendChild(document.createTextNode(' ' + titel.replace(/^[^A-Za-z0-9ÄÖÜäöüß]+/, '')));
                    } else {
                        h3.textContent = titel;
                    }
                }
                if (beschr && subtitle) subtitle.textContent = beschr;
            });

            // Hinweis
            if (form.note) {
                let noteEl = document.querySelector('.qualification-note');
                if (!noteEl) {
                    // Falls noch nicht vorhanden → dynamisch unter Qualifikationen einfügen
                    const qualSection = document.querySelector('.form-section:nth-of-type(3)'); // grobe Annahme
                    if (qualSection) {
                        noteEl = document.createElement('div');
                        noteEl.className = 'qualification-note';
                        qualSection.appendChild(noteEl);
                    }
                }
                if (noteEl) noteEl.innerHTML = `<strong>Wichtiger Hinweis:</strong> ${form.note}`;
            }
        }

        // SUBMIT BUTTON ---------------------------------------
        if (submit && submit['Text']) {
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.innerHTML = `<span class="btn-icon">${submit['Icon'] || '📤'}</span>${submit['Text']}`;
        }

        console.log('✅ Registration content updated (DOM applied)');
    }

    getIconForSection(title) {
        const iconMap = {
            'Was ist die Ehrenamtskarte?': '🎫',
            'Voraussetzungen für Feuerwehren': '✅',
            'Vorteile in Bayern': '🎁',
            'Datenschutz & Sicherheit': '🔒',
            'Beantragung & Bearbeitung': '📋',
            'Kontakt & Zuständigkeit': '💬'
        };
        
        return iconMap[title] || '📄';
    }

    renderInfoCards() {
        const infoGrid = document.querySelector('.info-grid');
        if (!infoGrid || !this.sections.length) return;

        // Clear existing cards
        infoGrid.innerHTML = '';

        // Create cards from sections
        this.sections.forEach(section => {
            const card = this.createCard(section);
            infoGrid.appendChild(card);
        });

        console.log(`🃏 Rendered ${this.sections.length} info cards`);
    }

    createCard(section) {
        const card = document.createElement('div');
        card.className = 'info-card';

        // Icon
        const icon = document.createElement('span');
        icon.className = 'info-icon';
        icon.textContent = section.icon;
        card.appendChild(icon);

        // Title
        const title = document.createElement('h3');
        title.textContent = section.title;
        card.appendChild(title);

        // Content
        const content = document.createElement('div');
        content.className = 'card-content';
        content.innerHTML = this.markdownToHTML(section.content);
        card.appendChild(content);

        return card;
    }

    markdownToHTML(text) {
        if (!text) return '';
        
        return text
            // Headers
            .replace(/^### (.+)$/gm, '<h4 style="color: var(--ff-red); margin: 15px 0 8px 0; font-size: 1.1rem; font-weight: 600;">$1</h4>')
            
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--ff-red); font-weight: 600;">$1</strong>')
            
            // Lists
            .replace(/^- (.+)$/gm, '<li style="margin-bottom: 8px; position: relative; padding-left: 20px;"><span style="position: absolute; left: 0; color: var(--ff-red); font-weight: bold;">•</span>$1</li>')
            
            // Wrap lists in <ul>
            .replace(/(<li[^>]*>.*<\/li>\s*)+/gs, match => 
                `<ul style="list-style: none; padding-left: 0; margin: 15px 0;">${match}</ul>`
            )
            
            // Paragraphs (double line breaks)
            .replace(/\n\s*\n/g, '</p><p style="margin-bottom: 15px; line-height: 1.7;">')
            .replace(/^(.)/m, '<p style="margin-bottom: 15px; line-height: 1.7;">$1')
            .replace(/(.)$/m, '$1</p>')
            
            // Single line breaks
            .replace(/\n/g, '<br>')
            
            // Clean up empty paragraphs
            .replace(/<p[^>]*><\/p>/g, '')
            .replace(/<p[^>]*>\s*<\/p>/g, '');
    }

    // Public method to reload content (for development)
    async reload() {
        console.log('🔄 Reloading content...');
        try {
            this.sections = [];
            this.registrationData = {};
            await this.loadAllContent();
            this.parseInfoContent();
            this.parseRegistrationContent();
            this.renderInfoCards();
            this.updateRegistrationContent();
            console.log('✅ Content reloaded successfully');
        } catch (error) {
            console.error('❌ Failed to reload content:', error);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.contentManager = new SimpleMarkdownManager();
});

// Also initialize if DOM is already loaded
if (document.readyState !== 'loading') {
    window.contentManager = new SimpleMarkdownManager();
}