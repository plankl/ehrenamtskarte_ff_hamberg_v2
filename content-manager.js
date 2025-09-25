/**
 * 📝 Simple Markdown Content Manager - Robust & Clean Implementation
 * Loads content.md and renders it as info cards
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

        this.registrationData = {};
        const lines = this.registrationContent.split('\n');
        let currentSection = '';

        for (const line of lines) {
            if (line.startsWith('## ')) {
                currentSection = line.replace('## ', '').trim();
                this.registrationData[currentSection] = {};
            } else if (line.startsWith('### ')) {
                const subsection = line.replace('### ', '').trim();
                this.registrationData[currentSection] = this.registrationData[currentSection] || {};
                this.registrationData[currentSection][subsection] = '';
            } else if (line.includes('**') && line.includes(':**')) {
                const [key, value] = line.split(':**');
                const cleanKey = key.replace(/\*/g, '').trim();
                const cleanValue = value ? value.trim() : '';
                
                if (currentSection) {
                    this.registrationData[currentSection] = this.registrationData[currentSection] || {};
                    this.registrationData[currentSection][cleanKey] = cleanValue;
                }
            } else if (line.trim() && !line.startsWith('---') && !line.startsWith('#')) {
                // Collect multi-line content
                if (currentSection && line.includes('**Wichtiger Hinweis:**')) {
                    this.registrationData[currentSection]['Hinweis'] = line.replace('**Wichtiger Hinweis:**', '').trim();
                }
            }
        }

        console.log('📝 Registration content parsed:', this.registrationData);
    }

    updateRegistrationContent() {
        if (!this.registrationData) return;

        // Update hero section
        if (this.registrationData['Hero Section']) {
            const heroData = this.registrationData['Hero Section'];
            
            // Update main title
            const heroTitle = document.querySelector('.hero h1');
            if (heroTitle && heroData['Titel']) {
                heroTitle.textContent = heroData['Titel'];
            }

            // Update subtitle
            const heroSubtitle = document.querySelector('.hero p');
            if (heroSubtitle && heroData['Untertitel']) {
                heroSubtitle.textContent = heroData['Untertitel'];
            }

            // Update hero badges
            if (heroData['Badge 1'] || heroData['Badge 2']) {
                const heroBadges = document.querySelectorAll('.hero .badge');
                if (heroBadges[0] && heroData['Badge 1']) heroBadges[0].textContent = heroData['Badge 1'];
                if (heroBadges[1] && heroData['Badge 2']) heroBadges[1].textContent = heroData['Badge 2'];
            }
        }

        // Update form sections
        if (this.registrationData['Formular Abschnitte']) {
            const formData = this.registrationData['Formular Abschnitte'];
            
            // Update form section titles
            const formSections = document.querySelectorAll('.form-section h3');
            if (formSections[0] && formData['Persönliche Daten']) {
                formSections[0].textContent = formData['Persönliche Daten'];
            }
            if (formSections[1] && formData['Kontaktdaten']) {
                formSections[1].textContent = formData['Kontaktdaten'];
            }
            if (formSections[2] && formData['Ehrenamtliche Tätigkeit']) {
                formSections[2].textContent = formData['Ehrenamtliche Tätigkeit'];
            }

            // Update qualification note
            if (formData['Hinweis']) {
                const qualificationNote = document.querySelector('.qualification-note');
                if (qualificationNote) {
                    qualificationNote.innerHTML = `<strong>Wichtiger Hinweis:</strong> ${formData['Hinweis']}`;
                }
            }
        }

        // Update submit button
        if (this.registrationData['Submit Button'] && this.registrationData['Submit Button']['Text']) {
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = this.registrationData['Submit Button']['Text'];
            }
        }

        console.log('✅ Registration content updated successfully');
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