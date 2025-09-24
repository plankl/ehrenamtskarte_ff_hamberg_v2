// Feuerwehr Hamberg - JavaScript für Datenverarbeitung (v2 UI)
class FirefighterDataManager {
    constructor() {
        this.form = document.getElementById('memberForm');
        this.statusBox = document.getElementById('status');
        this.previewBtn = document.querySelector('.preview-btn');
        this.submitBtn = document.querySelector('.submit-btn');

        // Modal elements
        this.modal = document.getElementById('previewModal');
        this.modalClose = this.modal?.querySelector('.close');
        this.modalEditBtn = this.modal?.querySelector('#editData');
        this.modalConfirmBtn = this.modal?.querySelector('#confirmSubmit');
        this.previewDataBox = document.getElementById('previewData');

        this.initializeEventListeners();
        this.checkTokenConfiguration();
        this.restoreDraft();
        this.setupTabs();
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
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.previewBtn.addEventListener('click', () => this.showPreview());

        if (this.modalClose) this.modalClose.addEventListener('click', () => this.hideModal());
        if (this.modalEditBtn) this.modalEditBtn.addEventListener('click', () => this.hideModal());
        if (this.modalConfirmBtn) this.modalConfirmBtn.addEventListener('click', () => this.enableSubmit());

        // Auto-save draft on input
        this.form.addEventListener('input', () => this.saveDraft());
    }

    checkTokenConfiguration() {
        const token = this.getGitHubToken(false);
        if (!token || token === 'GITHUB_TOKEN_PLACEHOLDER') {
            console.warn('⚠️ GitHub token not configured. Submission may prompt for token.');
        } else {
            console.log('✅ GitHub token available');
        }
    }

    getGitHubToken(allowPrompt = true) {
        if (window.GITHUB_CONFIG && window.GITHUB_CONFIG.token &&
            window.GITHUB_CONFIG.token !== 'GITHUB_TOKEN_PLACEHOLDER') {
            return window.GITHUB_CONFIG.token;
        }
        return allowPrompt ? (window.prompt('Bitte geben Sie Ihr GitHub Personal Access Token ein:') || '').trim() : '';
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
        
        // Ensure Datenschutzzustimmung
        const ds = document.getElementById('datenschutz');
        if (!ds.checked) {
            this.setStatus('Bitte stimmen Sie der Datenverarbeitung zu.', 'error');
            return false;
        }
        
        // Validate access password
        const accessPassword = this.value('access_password');
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
            console.warn('⚠️ No access password configured in secrets - basic validation only');
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
        this.submitBtn.style.display = 'none';
        this.setStatus('Bitte prüfen Sie die Daten in der Vorschau.', 'info');
    }

    showModal() { this.modal?.classList.add('open'); }
    hideModal() { this.modal?.classList.remove('open'); }

    enableSubmit() {
        this.hideModal();
        this.submitBtn.style.display = '';
        this.submitBtn.focus();
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
                throw new Error(err.message || res.statusText);
            }

            // Trigger data processing (optional webhook or action)
            this.triggerDataProcessing(token, owner, repo, data).catch(console.warn);

            this.setStatus('✅ Erfolgreich übermittelt! Vielen Dank für Ihre Daten.', 'success');
            this.clearDraft();
            this.form.reset();
            this.submitBtn.style.display = 'none';
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

        const logContent = JSON.stringify(logEntry, null, 2) + '\n';
        const encodedLog = btoa(unescape(encodeURIComponent(logContent)));

        try {
            await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/logs/processing-${new Date().toISOString().split('T')[0]}.log`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `📊 Log: Member added - ${data.person.vorname} ${data.person.nachname}`,
                    content: encodedLog,
                    branch: 'data'
                })
            });
        } catch (error) {
            console.warn('Logging failed:', error.message);
        }
    }

    setStatus(message, type = 'info') {
        if (!this.statusBox) return;
        this.statusBox.textContent = message;
        this.statusBox.className = 'status-message';
        this.statusBox.classList.add(type);
    }

    saveDraft() {
        const formData = new FormData(this.form);
        const data = {};
        for (const [k, v] of formData.entries()) data[k] = v;
        // Also include checkbox states explicitly
        ['mta_absolviert','dienstjahre_25','dienstjahre_40','datenschutz'].forEach(id => {
            const el = document.getElementById(id);
            if (el) data[id] = el.checked ? 'on' : '';
        });
        localStorage.setItem('ff_hamberg_v2_draft', JSON.stringify(data));
    }

    restoreDraft() {
        const raw = localStorage.getItem('ff_hamberg_v2_draft');
        if (!raw) return;
        try {
            const data = JSON.parse(raw);
            Object.entries(data).forEach(([k, v]) => {
                const el = this.form.querySelector(`[name="${k}"]`);
                if (!el) return;
                if (el.type === 'checkbox') el.checked = v === 'on'; else el.value = v;
            });
            console.log('✅ Entwurf wiederhergestellt');
        } catch {}
    }

    clearDraft() { localStorage.removeItem('ff_hamberg_v2_draft'); }
}

document.addEventListener('DOMContentLoaded', () => {
    new FirefighterDataManager();
    console.log('🚒 Feuerwehr Hamberg - System initialisiert');
});