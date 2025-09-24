// ========================================= //
// FEUERWEHR HAMBERG - MODERN JAVASCRIPT     //
// ========================================= //

// Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('ff-theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupToggle();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ff-theme', theme);
        this.currentTheme = theme;
        
        // Update meta theme-color for mobile browsers
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = theme === 'dark' ? '#1a202c' : '#e53e3e';
        }
    }

    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    setupToggle() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    }
}

// Enhanced Tab System
class TabManager {
    constructor() {
        this.init();
    }

    init() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = btn.dataset.tab;
                this.showTab(targetTab);
            });
        });
    }
    
    showTab(tabName) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Remove active classes
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(tabName);
        
        if (activeBtn && activeContent) {
            activeBtn.classList.add('active');
            activeContent.classList.add('active');
        }
    }
}

// Main Firefighter Data Manager - Enhanced
class FirefighterDataManager {
    constructor() {
        this.form = document.getElementById('memberForm');
        this.statusOverlay = document.getElementById('statusOverlay');
        
        // Modal elements
        this.modal = document.getElementById('confirmModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalConfirmBtn = document.getElementById('confirmButton');
        
        // Configuration
        this.config = window.GITHUB_CONFIG || {};
        
        this.init();
    }

    init() {
        if (this.form) {
            this.initializeEventListeners();
            this.checkTokenConfiguration();
            this.restoreDraft();
        }
        console.log('🚒 Feuerwehr Hamberg - System initialisiert');
    }

    initializeEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            // Auto-save draft on input
            this.form.addEventListener('input', () => this.saveDraft());
        }
    }

    checkTokenConfiguration() {
        const token = this.getGitHubToken(false);
        if (!token) {
            this.setStatus('ℹ️ Beim ersten Absenden werden Sie nach Ihrem GitHub Token gefragt.', 'info');
        }

        // Check password configuration
        const configPassword = window.GITHUB_CONFIG?.accessPassword;
        if (!configPassword || configPassword === 'FEUERWEHR_ACCESS_PASSWORD_PLACEHOLDER') {
            if (this.config.isDevelopment) {
                this.setStatus('⚠️ Feuerwehr-Passwort nicht konfiguriert - Grundvalidierung aktiv.', 'info');
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        try {
            this.setStatus('📤 Übermittle Daten...', 'info');
            
            const success = await this.submitToGitHub();
            
            if (success) {
                this.setStatus('✅ Erfolgreich übermittelt! Vielen Dank für Ihre Daten.', 'success');
                this.clearDraft();
                
                // Reset form after successful submission
                setTimeout(() => {
                    this.form.reset();
                }, 2000);
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.setStatus(`❌ Fehler: ${error.message}`, 'error');
        }
    }

    validateForm() {
        // Built-in validation first
        if (!this.form.checkValidity()) {
            this.form.reportValidity();
            return false;
        }
        
        // Validate access password
        const accessPassword = this.value('passwort');
        const configPassword = window.GITHUB_CONFIG?.accessPassword;
        
        if (configPassword && configPassword !== 'FEUERWEHR_ACCESS_PASSWORD_PLACEHOLDER') {
            if (!accessPassword) {
                this.setStatus('Bitte geben Sie das Feuerwehr-Passwort ein.', 'error');
                return false;
            }
            if (accessPassword !== configPassword) {
                this.setStatus('❌ Falsches Feuerwehr-Passwort. Bitte wenden Sie sich an die Feuerwehr-Leitung.', 'error');
                return false;
            }
        } else {
            // Fallback: Basic validation if no password configured
            if (!accessPassword) {
                this.setStatus('Bitte geben Sie das Feuerwehr-Passwort ein.', 'error');
                return false;
            }
            if (!this.config.isDevelopment) {
                console.warn('⚠️ No access password configured in secrets - basic validation only');
            }
        }
        
        return true;
    }

    async submitToGitHub() {
        const token = this.getGitHubToken(true);
        if (!token) throw new Error('Kein GitHub Token verfügbar');

        const { owner, repo } = this.getRepoConfig();
        const data = this.collectFormData();
        
        const filename = `anmeldung_${Date.now()}_${data.nachname}_${data.vorname}.json`;
        const content = btoa(JSON.stringify(data, null, 2));

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/${filename}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Neue Anmeldung: ${data.vorname} ${data.nachname}`,
                content: content,
                branch: 'main'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API Fehler: ${errorData.message || response.statusText}`);
        }

        return true;
    }

    collectFormData() {
        const data = {
            timestamp: new Date().toISOString(),
            nachname: this.value('nachname'),
            vorname: this.value('vorname'),
            geburtsdatum: this.value('geburtsdatum'),
            telefon: this.value('telefon') || null,
            email: this.value('email'),
            strasse: this.value('strasse'),
            plz: this.value('plz'),
            ort: this.value('ort'),
            qualifikationen: this.getQualifikationen()
        };
        
        return data;
    }

    getQualifikationen() {
        const checkboxes = this.form.querySelectorAll('input[name="qualifikationen"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    value(name) {
        const element = this.form.querySelector(`[name="${name}"]`);
        return element ? element.value.trim() : '';
    }

    getGitHubToken(prompt = false) {
        let token = localStorage.getItem('github_token');
        
        if (!token && prompt) {
            token = window.prompt('Bitte geben Sie Ihr GitHub Personal Access Token ein:');
            if (token) {
                localStorage.setItem('github_token', token);
            }
        }
        
        return token;
    }

    getRepoConfig() {
        try {
            const configOwner = window.GITHUB_CONFIG?.owner;
            const configRepo = window.GITHUB_CONFIG?.repo;
            const owner = configOwner || 'plankl';
            const repo = configRepo || 'ehrenamtskarte_ff_hamberg_v2';
            return { owner, repo };
        } catch {
            return { owner: 'plankl', repo: 'ehrenamtskarte_ff_hamberg_v2' };
        }
    }

    setStatus(message, type = 'info') {
        if (!this.statusOverlay) return;
        
        this.statusOverlay.textContent = message;
        this.statusOverlay.className = `status-overlay show ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (this.statusOverlay) {
                this.statusOverlay.classList.remove('show');
            }
        }, 5000);
        
        console.log(`Status (${type}): ${message}`);
    }

    saveDraft() {
        if (!this.form) return;
        
        const formData = new FormData(this.form);
        const data = {};
        for (const [k, v] of formData.entries()) {
            data[k] = v;
        }
        
        // Save qualifications checkboxes
        const qualCheckboxes = this.form.querySelectorAll('input[name="qualifikationen"]:checked');
        data.qualifikationen = Array.from(qualCheckboxes).map(cb => cb.value);
        
        localStorage.setItem('ff_hamberg_v2_draft', JSON.stringify(data));
    }

    restoreDraft() {
        if (!this.form) return;
        
        const raw = localStorage.getItem('ff_hamberg_v2_draft');
        if (!raw) return;
        
        try {
            const data = JSON.parse(raw);
            
            // Restore regular form fields
            Object.entries(data).forEach(([k, v]) => {
                if (k === 'qualifikationen') return; // Handle separately
                
                const el = this.form.querySelector(`[name="${k}"]`);
                if (!el) return;
                
                if (el.type === 'checkbox') {
                    el.checked = v === 'on' || v === true;
                } else {
                    el.value = v;
                }
            });
            
            // Restore qualifications
            if (data.qualifikationen && Array.isArray(data.qualifikationen)) {
                data.qualifikationen.forEach(value => {
                    const checkbox = this.form.querySelector(`input[name="qualifikationen"][value="${value}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            console.log('✅ Entwurf wiederhergestellt');
        } catch (error) {
            console.warn('Fehler beim Wiederherstellen des Entwurfs:', error);
        }
    }

    clearDraft() { 
        localStorage.removeItem('ff_hamberg_v2_draft'); 
    }
}

// Global functions for easy access
function toggleTheme() {
    if (window.themeManager) {
        window.themeManager.toggle();
    }
}

function showTab(tabName) {
    if (window.tabManager) {
        window.tabManager.showTab(tabName);
    }
}

function resetForm() {
    if (window.firefighterDataManager && window.firefighterDataManager.form) {
        window.firefighterDataManager.form.reset();
        window.firefighterDataManager.clearDraft();
        console.log('📝 Formular zurückgesetzt');
    }
}

function closeModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Initialize all systems when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme Manager
    window.themeManager = new ThemeManager();
    
    // Initialize Tab Manager
    window.tabManager = new TabManager();
    
    // Initialize Main App
    window.firefighterDataManager = new FirefighterDataManager();
    
    console.log('🚒 Feuerwehr Hamberg - Alle Systeme initialisiert');
    
    // Debug: Check if elements exist
    console.log('Theme Toggle Button:', document.getElementById('themeToggle'));
    console.log('Tab Buttons:', document.querySelectorAll('.tab-btn'));
    console.log('Tab Contents:', document.querySelectorAll('.tab-content'));
    console.log('Form:', document.getElementById('memberForm'));
});