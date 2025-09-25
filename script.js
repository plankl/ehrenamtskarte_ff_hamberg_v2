// ========================================= //
// FEUERWEHR HAMBERG - MODERN JAVASCRIPT     //
// ========================================= //

// Utility functions for safer DOM operations
function safeElementOperation(element, operation, fallback = null) {
    try {
        if (element && typeof element === 'object' && element.nodeType === 1) {
            return operation(element);
        } else {
            console.warn('⚠️ Element not available for operation');
            return fallback;
        }
    } catch (error) {
        console.error('🚨 Element operation failed:', error);
        return fallback;
    }
}

function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

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
        // Core elements with defensive initialization
        this.form = document.getElementById('memberForm');
        this.statusOverlay = document.getElementById('statusOverlay');
        
        // Submit button with multiple fallback selectors
        this.submitBtn = document.querySelector('#memberForm button[type="submit"]') || 
                        document.querySelector('button[type="submit"]') ||
                        document.querySelector('.btn-primary');
        
        // Modal elements - updated selectors with null checks
        this.modal = document.getElementById('confirmModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalConfirmBtn = document.getElementById('confirmButton');
        this.previewDataBox = document.getElementById('previewData');
        
        // Configuration
        this.config = window.GITHUB_CONFIG || {};
        
        // Debug logging for troubleshooting
        console.log('🔧 FirefighterDataManager Elements:', {
            form: !!this.form,
            statusOverlay: !!this.statusOverlay,
            submitBtn: !!this.submitBtn,
            modal: !!this.modal
        });
        
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

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const panes = document.querySelectorAll('.tab-pane');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const target = document.getElementById(btn.dataset.tab);
                if (target) target.classList.add('active');
            });
        });
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
        const password = window.GITHUB_CONFIG?.accessPassword;
        const usesMasterToken = window.GITHUB_CONFIG?.usesMasterToken;
        
        if (usesMasterToken && token && token !== 'GITHUB_TOKEN_PLACEHOLDER') {
            console.log('✅ Master GitHub token configured - keine Benutzer-Eingabe erforderlich');
        } else if (!token || token === 'GITHUB_TOKEN_PLACEHOLDER' || token === 'REQUIRES_USER_TOKEN') {
            console.warn('⚠️ GitHub token not configured. Submission will prompt for token.');
            this.setStatus('ℹ️ Beim ersten Absenden werden Sie nach Ihrem GitHub Token gefragt.', 'info');
        } else {
            console.log('✅ GitHub token available');
        }
        
        if (!password || password === 'FEUERWEHR_ACCESS_PASSWORD_PLACEHOLDER') {
            if (!this.config.isDevelopment) {
                console.warn('⚠️ No access password configured in secrets - basic validation only');
                this.setStatus('⚠️ Feuerwehr-Passwort nicht konfiguriert - Grundvalidierung aktiv.', 'info');
            }
        } else {
            console.log('✅ Feuerwehr access password configured');
        }
    }

    getGitHubToken(allowPrompt = true) {
        // If using master token, return it directly
        if (window.GITHUB_CONFIG?.usesMasterToken && window.GITHUB_CONFIG.token &&
            window.GITHUB_CONFIG.token !== 'GITHUB_TOKEN_PLACEHOLDER') {
            return window.GITHUB_CONFIG.token;
        }
        
        // Check if token is already stored in session
        let token = sessionStorage.getItem('ff_hamberg_github_token');
        if (token && token !== 'GITHUB_TOKEN_PLACEHOLDER') {
            return token;
        }
        
        // Check config
        if (window.GITHUB_CONFIG && window.GITHUB_CONFIG.token &&
            window.GITHUB_CONFIG.token !== 'GITHUB_TOKEN_PLACEHOLDER' &&
            window.GITHUB_CONFIG.token !== 'REQUIRES_USER_TOKEN') {
            token = window.GITHUB_CONFIG.token;
            sessionStorage.setItem('ff_hamberg_github_token', token);
            return token;
        }
        
        // Prompt user with better instructions
        if (allowPrompt) {
            const message = `🔐 GitHub Personal Access Token benötigt

Für die sichere Datenübertragung benötigen wir Ihr GitHub Token.

📋 So erhalten Sie ein Token:
1. Gehen Sie zu: github.com → Settings → Developer settings
2. Personal access tokens → Generate new token (classic)
3. Scopes: 'repo' und 'workflow' auswählen
4. Token kopieren und hier einfügen

Token eingeben:`;
            
            token = (window.prompt(message) || '').trim();
            if (token) {
                sessionStorage.setItem('ff_hamberg_github_token', token);
            }
            return token;
        }
        
        return '';
    }

    getRepoInfo() {
        // Try to infer owner and repo from GitHub Pages URL
        try {
            const host = window.location.hostname; // e.g., plankl.github.io
            const path = window.location.pathname; // e.g., /ff_hamberg_ehrenamtskarte_v2/
            const owner = host.includes('.github.io') ? host.split('.github.io')[0] : 'plankl';
            const pathParts = path.split('/').filter(Boolean);
            const repo = pathParts.length ? pathParts[0] : 'ff_hamberg_ehrenamtskarte_v2';
            // Allow override via config
            const cfgOwner = window.GITHUB_CONFIG?.repoOwner;
            const cfgRepo = window.GITHUB_CONFIG?.repoName;
            return { owner: cfgOwner || owner, repo: cfgRepo || repo };
        } catch {
            return { owner: 'plankl', repo: 'ff_hamberg_ehrenamtskarte_v2' };
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

    collectFormData() {
        const data = {
            timestamp: new Date().toISOString(),
            person: {
                nachname: this.value('nachname'),
                vorname: this.value('vorname'),
                geburtsdatum: this.value('geburtsdatum'),
                email: this.value('email'),
                telefon: this.value('telefon')
            },
            adresse: {
                strasse: this.value('strasse'),
                hausnummer: this.value('hausnummer'),
                plz: this.value('plz'),
                ort: this.value('ort')
            },
            qualifikationen: {
                mta_absolviert: this.checked('mta_absolviert'),
                dienstjahre_25: this.checked('dienstjahre_25'),
                dienstjahre_40: this.checked('dienstjahre_40')
            },
            consent: {
                datenschutz: this.checked('datenschutz')
            },
            meta: {
                accessVerified: !!this.value('access_password')
            }
        };
        return data;
    }

    value(id) { return (document.getElementById(id)?.value || '').trim(); }
    checked(id) { return !!document.getElementById(id)?.checked; }

    showPreview() {
        if (!this.validateForm()) return;
        const d = this.collectFormData();
        const html = `
            <div class="preview-grid">
                <div><strong>Name:</strong> ${d.person.vorname} ${d.person.nachname}</div>
                <div><strong>Geburtsdatum:</strong> ${d.person.geburtsdatum}</div>
                <div><strong>E-Mail:</strong> ${d.person.email}</div>
                <div><strong>Telefon:</strong> ${d.person.telefon}</div>
                <div><strong>Adresse:</strong> ${d.adresse.strasse} ${d.adresse.hausnummer}, ${d.adresse.plz} ${d.adresse.ort}</div>
                <div><strong>MTA:</strong> ${d.qualifikationen.mta_absolviert ? 'Ja' : 'Nein'}</div>
                <div><strong>25 Jahre:</strong> ${d.qualifikationen.dienstjahre_25 ? 'Ja' : 'Nein'}</div>
                <div><strong>40 Jahre:</strong> ${d.qualifikationen.dienstjahre_40 ? 'Ja' : 'Nein'}</div>
            </div>`;
        if (this.previewDataBox) this.previewDataBox.innerHTML = html;
        this.showModal();
        // Ensure submit stays hidden until confirmed
        if (this.submitBtn) {
            this.submitBtn.style.display = 'none';
        }
        this.setStatus('Bitte prüfen Sie die Daten in der Vorschau.', 'info');
    }

    showModal() { this.modal?.classList.add('open'); }
    hideModal() { this.modal?.classList.remove('open'); }

    enableSubmit() {
        this.hideModal();
        if (this.submitBtn) {
            this.submitBtn.style.display = '';
            try {
                this.submitBtn.focus();
            } catch (error) {
                console.warn('⚠️ Submit button focus failed:', error);
            }
        }
        this.setStatus('Vorschau bestätigt. Sie können jetzt senden.', 'success');
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (!this.validateForm()) return;
        try {
            this.setStatus('Übermittle Daten...', 'loading');
            const token = this.getGitHubToken(true);
            if (!token) throw new Error('Kein GitHub Token verfügbar.');

            const data = this.collectFormData();
            const { owner, repo } = this.getRepoInfo();

            // Check for duplicate entries
            await this.checkForDuplicates(token, owner, repo, data);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `member-${data.person.nachname}-${data.person.vorname}-${timestamp}.json`;
            const fileContent = JSON.stringify(data, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(fileContent)));

            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/members/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `🚒 Add member: ${data.person.vorname} ${data.person.nachname} (${new Date().toLocaleDateString('de-DE')})`,
                    content: encodedContent,
                    branch: 'data'
                })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                
                if (res.status === 401) {
                    // Clear stored token if unauthorized
                    sessionStorage.removeItem('ff_hamberg_github_token');
                    throw new Error('GitHub Token ungültig oder abgelaufen. Bitte versuchen Sie es erneut - Sie werden nach einem neuen Token gefragt.');
                }
                
                if (res.status === 404 && err.message?.includes('Branch')) {
                    throw new Error('Data Branch nicht gefunden. Bitte kontaktieren Sie den Administrator.');
                }
                
                throw new Error(err.message || `HTTP ${res.status}: ${res.statusText}`);
            }

            // Trigger data processing (optional webhook or action)
            this.triggerDataProcessing(token, owner, repo, data).catch(console.warn);

            this.setStatus('✅ Erfolgreich übermittelt! Vielen Dank für Ihre Daten.', 'success');
            this.clearDraft();
            this.form.reset();
            
            // Hide submit button if it exists
            if (this.submitBtn) {
                this.submitBtn.style.display = 'none';
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            this.setStatus(`❌ Fehler: ${error.message}`, 'error');
        }
    }

    async checkForDuplicates(token, owner, repo, data) {
        try {
            // Get list of existing files
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/members?ref=data`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (res.ok) {
                const files = await res.json();
                const existingNames = files.map(f => f.name.toLowerCase());
                const newName = `member-${data.person.nachname}-${data.person.vorname}`.toLowerCase();
                
                const duplicate = existingNames.find(name => 
                    name.includes(newName) || 
                    name.includes(data.person.email.toLowerCase())
                );
                
                if (duplicate) {
                    throw new Error(`Möglicherweise bereits vorhanden: ${data.person.vorname} ${data.person.nachname}. Bei Fragen wenden Sie sich an die Feuerwehr-Leitung.`);
                }
            }
        } catch (error) {
            if (error.message.includes('bereits vorhanden')) throw error;
            // If duplicate check fails, continue anyway (branch might not exist yet)
            console.warn('Duplicate check failed:', error.message);
        }
    }

    async triggerDataProcessing(token, owner, repo, data) {
        // Create a processing log entry
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: 'member_added',
            member: `${data.person.vorname} ${data.person.nachname}`,
            email: data.person.email,
            qualifications: data.qualifikationen
        };

        const logFileName = `processing-${new Date().toISOString().split('T')[0]}.log`;
        const logContent = JSON.stringify(logEntry, null, 2) + '\n';
        
        try {
            // Try to get existing file first
            let existingContent = '';
            let sha = null;
            
            try {
                const existingResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/logs/${logFileName}?ref=data`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (existingResponse.ok) {
                    const existingData = await existingResponse.json();
                    existingContent = atob(existingData.content) + '\n';
                    sha = existingData.sha;
                }
            } catch (error) {
                // File doesn't exist yet, that's fine
                console.log('Creating new log file');
            }
            
            const finalContent = existingContent + logContent;
            const encodedLog = btoa(unescape(encodeURIComponent(finalContent)));

            const body = {
                message: `📊 Log: Member added - ${data.person.vorname} ${data.person.nachname}`,
                content: encodedLog,
                branch: 'data'
            };
            
            if (sha) {
                body.sha = sha;
            }

            await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/logs/${logFileName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(body)
            });
            
            console.log('✅ Processing log updated successfully');
        } catch (error) {
            console.warn('Logging failed:', error.message);
        }
    }

    setStatus(message, type = 'info') {
        // Always log the status for debugging
        console.log(`Status (${type}): ${message}`);
        
        // Safe DOM manipulation
        if (this.statusOverlay && typeof this.statusOverlay.textContent !== 'undefined') {
            try {
                this.statusOverlay.textContent = message;
                this.statusOverlay.className = `status-overlay show ${type}`;
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    if (this.statusOverlay && this.statusOverlay.classList) {
                        this.statusOverlay.classList.remove('show');
                    }
                }, 5000);
            } catch (error) {
                console.warn('⚠️ Status overlay update failed:', error);
                // Fallback: show alert if DOM manipulation fails
                if (type === 'error') {
                    alert(`Fehler: ${message}`);
                }
            }
        } else {
            console.warn('⚠️ Status overlay element not available');
            // Fallback for critical messages
            if (type === 'error') {
                alert(`Fehler: ${message}`);
            }
        }
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

    clearDraft() { localStorage.removeItem('ff_hamberg_v2_draft'); }
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
});

// Global error handling for better stability
window.addEventListener('error', (event) => {
    console.error('🚨 Global JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // Don't show alerts for every error, just log them
    return true; // Prevent default browser error handling
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);
    
    // Prevent the default handling (which would show an error in console)
    event.preventDefault();
});