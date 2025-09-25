/**
 * 📝 Markdown Content Management System für Feuerwehr Hamberg Ehrenamtskarte
 * Lädt Inhalte aus separaten .md-Dateien und rendert sie dynamisch
 */

class MarkdownContentManager {
    constructor() {
        this.registrationContent = null;
        this.infoContent = null;
        this.isLoaded = false;
        this.init();
    }

    async init() {
        try {
            await this.loadAllContent();
            this.renderContent();
            console.log('✅ Markdown Content Management System initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Markdown Content Management System:', error);
            this.handleFallback();
        }
    }

    async loadAllContent() {
        try {
            // Lade beide Markdown-Dateien parallel
            const [registrationResponse, infoResponse] = await Promise.all([
                fetch('./content-registration.md'),
                fetch('./content-info.md')
            ]);

            if (!registrationResponse.ok || !infoResponse.ok) {
                throw new Error('Failed to load one or more content files');
            }

            const registrationText = await registrationResponse.text();
            const infoText = await infoResponse.text();

            // Parse die Markdown-Inhalte
            this.registrationContent = this.parseMarkdown(registrationText);
            this.infoContent = this.parseMarkdown(infoText);
            
            this.isLoaded = true;
            console.log('📄 Markdown content loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading markdown files:', error);
            throw error;
        }
    }

    parseMarkdown(text) {
        const content = {};
        const lines = text.split('\n');
        let currentSection = '';
        let currentSubsection = '';
        let currentContent = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Hauptüberschriften # 
            if (line.startsWith('# ')) {
                if (currentSection && currentContent.length > 0) {
                    this.saveContent(content, currentSection, currentSubsection, currentContent);
                }
                currentSection = line.replace('# ', '').trim();
                currentSubsection = '';
                currentContent = [];
            }
            // Unterüberschriften ##
            else if (line.startsWith('## ')) {
                if (currentSection && currentContent.length > 0) {
                    this.saveContent(content, currentSection, currentSubsection, currentContent);
                }
                currentSubsection = line.replace('## ', '').trim();
                currentContent = [];
            }
            // Unter-Unterüberschriften ###
            else if (line.startsWith('### ')) {
                if (currentSection && currentContent.length > 0) {
                    this.saveContent(content, currentSection, currentSubsection, currentContent);
                }
                currentSubsection = line.replace('### ', '').trim();
                currentContent = [];
            }
            // Trennlinien ignorieren
            else if (line.trim() === '---') {
                continue;
            }
            // Normaler Inhalt
            else {
                currentContent.push(line);
            }
        }

        // Letzter Abschnitt
        if (currentSection && currentContent.length > 0) {
            this.saveContent(content, currentSection, currentSubsection, currentContent);
        }

        return content;
    }

    saveContent(content, section, subsection, lines) {
        const key = subsection || section;
        const cleanContent = lines.filter(line => line.trim() !== '').join('\n').trim();
        
        if (!content[section]) {
            content[section] = {};
        }
        
        if (subsection) {
            content[section][subsection] = cleanContent;
        } else {
            content[section]['_content'] = cleanContent;
        }
    }

    renderContent() {
        if (!this.isLoaded) {
            console.warn('⚠️ Content not loaded, skipping render');
            return;
        }

        // Update registration content
        this.updateRegistrationContent();
        
        // Update info page content
        this.updateInfoContent();

        console.log('🎨 All markdown content rendered successfully');
    }

    updateRegistrationContent() {
        const regContent = this.registrationContent;
        if (!regContent) return;

        // Update Hero-Bereich
        if (regContent['📝 Registrierungsbereich - Feuerwehr Hamberg']) {
            const heroSection = regContent['📝 Registrierungsbereich - Feuerwehr Hamberg'];
            this.updateHeroFromMarkdown(heroSection);
        }

        // Update Form sections
        if (regContent['Formular-Abschnitte']) {
            this.updateFormSections(regContent['Formular-Abschnitte']);
        }

        console.log('📝 Registration content updated');
    }

    updateInfoContent() {
        const infoContent = this.infoContent;
        if (!infoContent) return;

        // Update info header
        if (infoContent['ℹ️ Informationsbereich - Ehrenamtskarte']) {
            this.updateInfoHeader(infoContent['ℹ️ Informationsbereich - Ehrenamtskarte']['Header']);
        }

        // Update info cards
        this.createInfoCardsFromMarkdown(infoContent);

        console.log('ℹ️ Info content updated');
    }

    updateHeroFromMarkdown(heroContent) {
        // Parse Hero-Bereich content
        const lines = heroContent.split('\n');
        let mainTitle = '', subtitle = '', badges = [];

        for (const line of lines) {
            if (line.includes('**Haupttitel:**')) {
                mainTitle = line.replace('**Haupttitel:**', '').trim();
            } else if (line.includes('**Untertitel:**')) {
                subtitle = line.replace('**Untertitel:**', '').trim();
            } else if (line.startsWith('- ') && (line.includes('👥') || line.includes('⏰') || line.includes('🎖️'))) {
                const badgeText = line.replace('- ', '').trim();
                const [icon, ...textParts] = badgeText.split(' ');
                badges.push({ icon, text: textParts.join(' ') });
            }
        }

        // Update DOM elements
        const titlePrimary = document.querySelector('.title-primary');
        const titleSecondary = document.querySelector('.title-secondary');
        
        if (titlePrimary && mainTitle) titlePrimary.textContent = mainTitle;
        if (titleSecondary && subtitle) titleSecondary.textContent = subtitle;

        // Update badges
        if (badges.length > 0) {
            const badgeElements = document.querySelectorAll('.badge-container .info-badge');
            badges.forEach((badge, index) => {
                if (badgeElements[index]) {
                    const icon = badgeElements[index].querySelector('.badge-icon');
                    const text = badgeElements[index].querySelector('.badge-text');
                    
                    if (icon && badge.icon) icon.textContent = badge.icon;
                    if (text && badge.text) text.textContent = badge.text;
                }
            });
        }
    }

    updateInfoHeader(headerContent) {
        if (!headerContent) return;

        const lines = headerContent.split('\n');
        let title = '', subtitle = '';

        for (const line of lines) {
            if (line.includes('**Titel:**')) {
                title = line.replace('**Titel:**', '').trim();
            } else if (line.includes('**Untertitel:**')) {
                subtitle = line.replace('**Untertitel:**', '').trim();
            }
        }

        const headerTitle = document.querySelector('.info-header h2');
        const headerSubtitle = document.querySelector('.info-header p');

        if (headerTitle && title) headerTitle.textContent = title;
        if (headerSubtitle && subtitle) headerSubtitle.textContent = subtitle;
    }

    createInfoCardsFromMarkdown(content) {
        const infoGrid = document.querySelector('.info-grid');
        if (!infoGrid) return;

        // Clear existing cards
        infoGrid.innerHTML = '';

        // Extract sections that should become cards
        const cardSections = [
            '🎫 Was ist die Ehrenamtskarte?',
            '✅ Voraussetzungen für Feuerwehren', 
            '🎁 Vorteile in Bayern',
            '🔒 Datenschutz & Sicherheit',
            '📋 Beantragung & Bearbeitung',
            '💬 Kontakt & Zuständigkeit'
        ];

        cardSections.forEach(sectionTitle => {
            if (content[sectionTitle]) {
                const card = this.createCardFromMarkdownSection(sectionTitle, content[sectionTitle]);
                infoGrid.appendChild(card);
            }
        });

        console.log(`🃏 Created ${cardSections.length} info cards from markdown`);
    }

    createCardFromMarkdownSection(title, sectionContent) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'info-card';

        // Extract icon from title
        const iconMatch = title.match(/^([\u{1F000}-\u{1F9FF}])/u);
        const icon = iconMatch ? iconMatch[1] : '📋';
        const cleanTitle = title.replace(/^[\u{1F000}-\u{1F9FF}]\s*/u, '');

        // Add icon
        const iconSpan = document.createElement('span');
        iconSpan.className = 'info-icon';
        iconSpan.textContent = icon;
        cardDiv.appendChild(iconSpan);

        // Add title
        const titleH3 = document.createElement('h3');
        titleH3.textContent = cleanTitle;
        cardDiv.appendChild(titleH3);

        // Process content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';
        
        if (typeof sectionContent === 'object') {
            // Multiple subsections
            Object.keys(sectionContent).forEach(key => {
                if (key !== '_content') {
                    const subsectionDiv = this.createSubsectionFromMarkdown(key, sectionContent[key]);
                    contentDiv.appendChild(subsectionDiv);
                }
            });
            
            // Main content
            if (sectionContent._content) {
                const mainContent = this.markdownToHTML(sectionContent._content);
                contentDiv.innerHTML += mainContent;
            }
        } else {
            // Simple content
            contentDiv.innerHTML = this.markdownToHTML(sectionContent);
        }

        cardDiv.appendChild(contentDiv);
        return cardDiv;
    }

    createSubsectionFromMarkdown(title, content) {
        const div = document.createElement('div');
        div.className = 'subsection';
        
        // Add subsection title if it's not just content
        if (title !== '_content') {
            const h4 = document.createElement('h4');
            h4.textContent = title;
            h4.style.color = 'var(--ff-red)';
            h4.style.marginBottom = '8px';
            h4.style.fontSize = '1.1rem';
            h4.style.fontWeight = '600';
            div.appendChild(h4);
        }

        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = this.markdownToHTML(content);
        div.appendChild(contentDiv);

        return div;
    }

    markdownToHTML(text) {
        if (!text) return '';
        
        return text
            // Headers
            .replace(/^### (.*$)/gim, '<h4 style="color: var(--ff-red); margin: 15px 0 8px 0; font-size: 1.1rem;">$1</h4>')
            .replace(/^## (.*$)/gim, '<h3 style="color: var(--text-primary); margin: 20px 0 10px 0; font-size: 1.3rem;">$1</h3>')
            
            // Bold text: **text** -> <strong>text</strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--ff-red);">$1</strong>')
            
            // Italic text: *text* -> <em>text</em>
            .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
            
            // Links: [text](url) -> <a href="url">text</a>
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--ff-red); text-decoration: none;">$1</a>')
            
            // Lists: - item -> <ul><li>item</li></ul>
            .replace(/^- (.+$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul style="list-style: none; padding-left: 20px;">$1</ul>')
            
            // List item styling
            .replace(/<li>/g, '<li style="margin-bottom: 8px; position: relative; padding-left: 20px;">')
            .replace(/<li style="margin-bottom: 8px; position: relative; padding-left: 20px;">/g, 
                '<li style="margin-bottom: 8px; position: relative; padding-left: 20px;"><span style="position: absolute; left: 0; color: var(--ff-red); font-weight: bold;">•</span>')
            
            // Paragraphs: double line break -> <p>
            .replace(/\n\s*\n/g, '</p><p>')
            .replace(/^(.)/m, '<p>$1')
            .replace(/(.)$/m, '$1</p>')
            
            // Single line breaks -> <br>
            .replace(/\n/g, '<br>')
            
            // Clean up empty paragraphs
            .replace(/<p><\/p>/g, '')
            .replace(/<p>\s*<\/p>/g, '');
    }

    updateFormSections(formContent) {
        // This would update form section titles and descriptions
        // Implementation depends on your specific form structure
        console.log('🔧 Form sections update - content available:', !!formContent);
    }

    handleFallback() {
        console.warn('⚠️ Using fallback content - markdown files could not be loaded');
        // The page will use the existing hardcoded content as fallback
    }

    // Public method to reload content (useful for development)
    async reload() {
        console.log('🔄 Reloading markdown content...');
        try {
            await this.loadAllContent();
            this.renderContent();
            console.log('✅ Markdown content reloaded successfully');
        } catch (error) {
            console.error('❌ Failed to reload markdown content:', error);
        }
    }

    // Get current content (for debugging)
    getContent() {
        return {
            registration: this.registrationContent,
            info: this.infoContent
        };
    }

    // Check if content is loaded
    isContentLoaded() {
        return this.isLoaded;
    }
}

// Initialize Markdown Content Management System
let markdownContentManager;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        markdownContentManager = new MarkdownContentManager();
    });
} else {
    markdownContentManager = new MarkdownContentManager();
}

// Make globally available for debugging
window.markdownContentManager = markdownContentManager;

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownContentManager;
}