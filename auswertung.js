// ========================================= //
// FEUERWEHR HAMBERG - AUSWERTUNG SYSTEM    //
// ========================================= //

class AuswertungManager {
    constructor() {
        this.applications = [];
        this.filteredApplications = [];
        this.charts = {};
        this.config = window.GITHUB_CONFIG || {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadApplications();
        console.log('📊 Auswertungssystem initialisiert');
    }

    setupEventListeners() {
        // Filter events
        const filterName = document.getElementById('filterName');
        const filterQualification = document.getElementById('filterQualification');
        
        if (filterName) {
            filterName.addEventListener('input', () => this.applyFilters());
        }
        if (filterQualification) {
            filterQualification.addEventListener('change', () => this.applyFilters());
        }
    }

    async loadApplications() {
        try {
            this.setStatus('📥 Lade Anmeldungen...', 'info');
            
            const token = this.getGitHubToken();
            if (!token) {
                this.setStatus('❌ Kein GitHub Token verfügbar. Bitte Token eingeben.', 'error');
                return;
            }

            const { owner, repo } = this.getRepoConfig();
            const applications = await this.fetchApplicationsFromGitHub(owner, repo, token);
            
            this.applications = applications;
            this.filteredApplications = [...applications];
            
            this.updateUI();
            this.setStatus(`✅ ${applications.length} Anmeldungen geladen`, 'success');
            
        } catch (error) {
            console.error('Fehler beim Laden der Anmeldungen:', error);
            this.setStatus(`❌ Fehler: ${error.message}`, 'error');
        }
    }

    async fetchApplicationsFromGitHub(owner, repo, token) {
        // Fetch all files from data directory
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API Fehler: ${response.statusText}`);
        }

        const files = await response.json();
        const applications = [];

        // Filter for JSON files that look like applications
        const applicationFiles = files.filter(file => 
            file.name.endsWith('.json') && file.name.includes('anmeldung_')
        );

        // Fetch content of each file
        for (const file of applicationFiles) {
            try {
                const fileResponse = await fetch(file.download_url);
                const content = await fileResponse.json();
                applications.push({
                    ...content,
                    filename: file.name,
                    created: new Date(content.timestamp || file.name.match(/anmeldung_(\d+)_/)?.[1] || Date.now())
                });
            } catch (error) {
                console.warn(`Fehler beim Laden der Datei ${file.name}:`, error);
            }
        }

        return applications.sort((a, b) => b.created - a.created);
    }

    updateUI() {
        this.updateTable();
        this.updateStatistics();
        this.updateCharts();
        this.updateBadges();
    }

    updateTable() {
        const tbody = document.getElementById('applicationsTableBody');
        if (!tbody) return;

        if (this.filteredApplications.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-cell">
                        Keine Anmeldungen gefunden
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredApplications.map((app, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${this.formatDate(app.created)}</td>
                <td><strong>${app.vorname} ${app.nachname}</strong></td>
                <td>${this.formatDate(new Date(app.geburtsdatum))}</td>
                <td>${app.ort}</td>
                <td>
                    <div class="qualifications-tags">
                        ${(app.qualifikationen || []).map(qual => 
                            `<span class="qual-tag">${qual}</span>`
                        ).join('')}
                    </div>
                </td>
                <td><a href="mailto:${app.email}">${app.email}</a></td>
            </tr>
        `).join('');
    }

    updateStatistics() {
        const totalCount = document.getElementById('totalCount');
        const truppmannCount = document.getElementById('truppmannCount');
        const years25Count = document.getElementById('years25Count');
        const years40Count = document.getElementById('years40Count');

        if (totalCount) totalCount.textContent = this.applications.length;
        
        const stats = this.calculateStatistics();
        if (truppmannCount) truppmannCount.textContent = stats.truppmann;
        if (years25Count) years25Count.textContent = stats.years25;
        if (years40Count) years40Count.textContent = stats.years40;
    }

    updateBadges() {
        const totalApplications = document.getElementById('totalApplications');
        const lastUpdate = document.getElementById('lastUpdate');

        if (totalApplications) {
            totalApplications.textContent = `${this.applications.length} Anmeldungen`;
        }

        if (lastUpdate && this.applications.length > 0) {
            const latest = this.applications[0].created;
            lastUpdate.textContent = `Letzte: ${this.formatDate(latest)}`;
        }
    }

    calculateStatistics() {
        const stats = {
            total: this.applications.length,
            truppmann: 0,
            years25: 0,
            years40: 0,
            monthly: {}
        };

        this.applications.forEach(app => {
            const qualifications = app.qualifikationen || [];
            if (qualifications.includes('Truppmann')) stats.truppmann++;
            if (qualifications.includes('25 Jahre aktiv')) stats.years25++;
            if (qualifications.includes('40 Jahre aktiv')) stats.years40++;

            // Monthly statistics
            const month = app.created.toISOString().substring(0, 7); // YYYY-MM
            stats.monthly[month] = (stats.monthly[month] || 0) + 1;
        });

        return stats;
    }

    updateCharts() {
        this.createQualificationChart();
        this.createMonthlyChart();
    }

    createQualificationChart() {
        const ctx = document.getElementById('qualificationChart');
        if (!ctx) return;

        const stats = this.calculateStatistics();
        
        if (this.charts.qualification) {
            this.charts.qualification.destroy();
        }

        this.charts.qualification = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Truppmann', '25 Jahre aktiv', '40 Jahre aktiv'],
                datasets: [{
                    data: [stats.truppmann, stats.years25, stats.years40],
                    backgroundColor: [
                        '#E53E3E',
                        '#3182CE',
                        '#38A169'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createMonthlyChart() {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;

        const stats = this.calculateStatistics();
        const monthlyData = stats.monthly;
        
        // Sort months and get last 12 months
        const sortedMonths = Object.keys(monthlyData).sort().slice(-12);
        
        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }

        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedMonths.map(month => {
                    const date = new Date(month + '-01');
                    return date.toLocaleDateString('de-DE', { year: 'numeric', month: 'short' });
                }),
                datasets: [{
                    label: 'Anmeldungen',
                    data: sortedMonths.map(month => monthlyData[month] || 0),
                    backgroundColor: '#E53E3E',
                    borderColor: '#C53030',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    applyFilters() {
        const nameFilter = document.getElementById('filterName')?.value.toLowerCase() || '';
        const qualFilter = document.getElementById('filterQualification')?.value || '';

        this.filteredApplications = this.applications.filter(app => {
            const nameMatch = !nameFilter || 
                app.vorname.toLowerCase().includes(nameFilter) ||
                app.nachname.toLowerCase().includes(nameFilter);

            const qualMatch = !qualFilter || 
                (app.qualifikationen || []).includes(qualFilter);

            return nameMatch && qualMatch;
        });

        this.updateTable();
    }

    clearFilters() {
        document.getElementById('filterName').value = '';
        document.getElementById('filterQualification').value = '';
        this.applyFilters();
    }

    // Export functions
    exportToExcel() {
        const ws = XLSX.utils.json_to_sheet(this.applications.map(app => ({
            'Datum': this.formatDate(app.created),
            'Vorname': app.vorname,
            'Nachname': app.nachname,
            'Geburtsdatum': app.geburtsdatum,
            'E-Mail': app.email,
            'Telefon': app.telefon || '',
            'Straße': app.strasse,
            'PLZ': app.plz,
            'Ort': app.ort,
            'Qualifikationen': (app.qualifikationen || []).join(', ')
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ehrenamtskarte Anmeldungen');
        
        XLSX.writeFile(wb, `Ehrenamtskarte_Anmeldungen_${this.formatDateForFilename(new Date())}.xlsx`);
    }

    exportToJSON() {
        const dataStr = JSON.stringify(this.applications, null, 2);
        this.downloadFile(dataStr, `Ehrenamtskarte_Anmeldungen_${this.formatDateForFilename(new Date())}.json`, 'application/json');
    }

    exportToCSV() {
        const headers = ['Datum', 'Vorname', 'Nachname', 'Geburtsdatum', 'E-Mail', 'Telefon', 'Straße', 'PLZ', 'Ort', 'Qualifikationen'];
        const csvContent = [
            headers.join(','),
            ...this.applications.map(app => [
                this.formatDate(app.created),
                app.vorname,
                app.nachname,
                app.geburtsdatum,
                app.email,
                app.telefon || '',
                app.strasse,
                app.plz,
                app.ort,
                (app.qualifikationen || []).join('; ')
            ].map(field => `"${field}"`).join(','))
        ].join('\n');

        this.downloadFile(csvContent, `Ehrenamtskarte_Anmeldungen_${this.formatDateForFilename(new Date())}.csv`, 'text/csv');
    }

    exportToHTML() {
        const stats = this.calculateStatistics();
        const html = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Ehrenamtskarte Anmeldungen - Bericht</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: flex; gap: 20px; margin-bottom: 30px; }
        .stat-box { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; flex: 1; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #E53E3E; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .qual-tag { background: #E53E3E; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin: 1px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚒 Feuerwehr Hamberg - Ehrenamtskarte Anmeldungen</h1>
        <p>Bericht erstellt am: ${this.formatDate(new Date())}</p>
    </div>
    
    <div class="stats">
        <div class="stat-box">
            <h3>${stats.total}</h3>
            <p>Gesamt Anmeldungen</p>
        </div>
        <div class="stat-box">
            <h3>${stats.truppmann}</h3>
            <p>Truppmann</p>
        </div>
        <div class="stat-box">
            <h3>${stats.years25}</h3>
            <p>25 Jahre aktiv</p>
        </div>
        <div class="stat-box">
            <h3>${stats.years40}</h3>
            <p>40 Jahre aktiv</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Nr.</th>
                <th>Datum</th>
                <th>Name</th>
                <th>Geburtsdatum</th>
                <th>Ort</th>
                <th>Qualifikationen</th>
                <th>E-Mail</th>
            </tr>
        </thead>
        <tbody>
            ${this.applications.map((app, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${this.formatDate(app.created)}</td>
                    <td><strong>${app.vorname} ${app.nachname}</strong></td>
                    <td>${this.formatDate(new Date(app.geburtsdatum))}</td>
                    <td>${app.ort}</td>
                    <td>${(app.qualifikationen || []).map(qual => `<span class="qual-tag">${qual}</span>`).join(' ')}</td>
                    <td>${app.email}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;

        this.downloadFile(html, `Ehrenamtskarte_Bericht_${this.formatDateForFilename(new Date())}.html`, 'text/html');
    }

    // Utility functions
    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('de-DE').format(date);
    }

    formatDateForFilename(date) {
        return date.toISOString().split('T')[0];
    }

    getGitHubToken() {
        let token = localStorage.getItem('github_token');
        
        if (!token) {
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
        const statusOverlay = document.getElementById('statusOverlay');
        if (!statusOverlay) return;
        
        statusOverlay.textContent = message;
        statusOverlay.className = `status-overlay show ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusOverlay.classList.remove('show');
        }, 5000);
        
        console.log(`Status (${type}): ${message}`);
    }
}

// Global functions for easy access
function clearFilters() {
    if (window.auswertungManager) {
        window.auswertungManager.clearFilters();
    }
}

function exportToExcel() {
    if (window.auswertungManager) {
        window.auswertungManager.exportToExcel();
    }
}

function exportToJSON() {
    if (window.auswertungManager) {
        window.auswertungManager.exportToJSON();
    }
}

function exportToHTML() {
    if (window.auswertungManager) {
        window.auswertungManager.exportToHTML();
    }
}

function exportToCSV() {
    if (window.auswertungManager) {
        window.auswertungManager.exportToCSV();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme Manager
    window.themeManager = new ThemeManager();
    
    // Initialize Tab Manager
    window.tabManager = new TabManager();
    
    // Initialize Auswertung Manager
    window.auswertungManager = new AuswertungManager();
    
    console.log('📊 Auswertung - Alle Systeme initialisiert');
});