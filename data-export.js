// ========================================= //
// AUTOMATED DATA EXPORT SYSTEM             //
// ========================================= //

class DataExportManager {
    constructor() {
        this.config = window.GITHUB_CONFIG || {};
    }

    async generateExports(applicationData) {
        const token = this.getGitHubToken();
        const { owner, repo } = this.getRepoConfig();
        
        if (!token || !owner || !repo) {
            console.warn('⚠️ Export generation skipped - missing configuration');
            return;
        }

        try {
            console.log('📊 Generating data exports...');
            
            // Get all existing applications
            const allApplications = await this.fetchAllApplications(token, owner, repo);
            
            // Add new application to the list
            allApplications.push(applicationData);
            
            // Generate all export formats
            await Promise.all([
                this.generateJSONExport(allApplications, token, owner, repo),
                this.generateCSVExport(allApplications, token, owner, repo),
                this.generateHTMLExport(allApplications, token, owner, repo),
                this.generateXLSXExport(allApplications, token, owner, repo)
            ]);
            
            console.log('✅ All export files generated successfully');
            
        } catch (error) {
            console.error('❌ Export generation failed:', error);
        }
    }

    async fetchAllApplications(token, owner, repo) {
        try {
            // Get all files from data/members directory
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/members?ref=data`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                return []; // No existing data
            }

            const files = await response.json();
            const applications = [];

            // Fetch each JSON file
            for (const file of files) {
                if (file.name.endsWith('.json')) {
                    try {
                        const fileResponse = await fetch(file.download_url);
                        const applicationData = await fileResponse.json();
                        applications.push(applicationData);
                    } catch (error) {
                        console.warn(`⚠️ Failed to load ${file.name}:`, error);
                    }
                }
            }

            return applications;
        } catch (error) {
            console.warn('⚠️ Failed to fetch existing applications:', error);
            return [];
        }
    }

    async generateJSONExport(applications, token, owner, repo) {
        const exportData = {
            generated: new Date().toISOString(),
            total: applications.length,
            applications: applications.map(app => ({
                ...app,
                id: this.generateId(app),
                qualification_summary: this.getQualificationSummary(app)
            }))
        };

        await this.uploadFile(
            'data/exports/all_members.json',
            JSON.stringify(exportData, null, 2),
            `📊 Update JSON export - ${applications.length} members`,
            token, owner, repo
        );
    }

    async generateCSVExport(applications, token, owner, repo) {
        const csvHeaders = [
            'ID', 'Timestamp', 'Nachname', 'Vorname', 'Geburtsdatum', 'Email', 'Telefon',
            'Straße', 'Hausnummer', 'PLZ', 'Ort',
            'MTA absolviert', '25 Jahre Dienst', '40 Jahre Dienst',
            'Qualifikationen erfüllt'
        ];

        const csvRows = applications.map(app => [
            this.generateId(app),
            app.timestamp,
            app.person.nachname || '',
            app.person.vorname || '',
            app.person.geburtsdatum || '',
            app.person.email || '',
            app.person.telefon || '',
            app.adresse.strasse || '',
            app.adresse.hausnummer || '',
            app.adresse.plz || '',
            app.adresse.ort || '',
            app.qualifikationen.mta_absolviert ? 'Ja' : 'Nein',
            app.qualifikationen.dienstjahre_25 ? 'Ja' : 'Nein',
            app.qualifikationen.dienstjahre_40 ? 'Ja' : 'Nein',
            this.getQualificationSummary(app)
        ]);

        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        await this.uploadFile(
            'data/exports/all_members.csv',
            csvContent,
            `📊 Update CSV export - ${applications.length} members`,
            token, owner, repo
        );
    }

    async generateHTMLExport(applications, token, owner, repo) {
        const stats = this.calculateStatistics(applications);
        
        const html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ehrenamtskarte - Mitgliederübersicht</title>
    <style>
        body { font-family: Inter, sans-serif; margin: 20px; background: #f8fafc; }
        .header { background: #e53e3e; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; color: #e53e3e; }
        .stat-label { color: #666; font-size: 0.9em; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; font-weight: 600; color: #2d3748; }
        tr:hover { background: #f7fafc; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 500; }
        .badge-success { background: #c6f6d5; color: #22543d; }
        .badge-warning { background: #fef5e7; color: #c05621; }
        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚒 Feuerwehr Hamberg - Ehrenamtskarte</h1>
        <p>Mitgliederübersicht - Generiert am ${new Date().toLocaleString('de-DE')}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${stats.total}</div>
            <div class="stat-label">Gesamte Anmeldungen</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.with_mta}</div>
            <div class="stat-label">MTA absolviert</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.with_25_years}</div>
            <div class="stat-label">25 Jahre Dienst</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.with_40_years}</div>
            <div class="stat-label">40 Jahre Dienst</div>
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Geburtsdatum</th>
                <th>Kontakt</th>
                <th>Adresse</th>
                <th>Qualifikationen</th>
                <th>Anmeldung</th>
            </tr>
        </thead>
        <tbody>
            ${applications.map(app => `
                <tr>
                    <td><strong>${app.person.nachname}, ${app.person.vorname}</strong></td>
                    <td>${app.person.geburtsdatum}</td>
                    <td>
                        ${app.person.email}<br>
                        <small>${app.person.telefon}</small>
                    </td>
                    <td>
                        ${app.adresse.strasse} ${app.adresse.hausnummer}<br>
                        <small>${app.adresse.plz} ${app.adresse.ort}</small>
                    </td>
                    <td>
                        ${app.qualifikationen.mta_absolviert ? '<span class="badge badge-success">MTA</span> ' : ''}
                        ${app.qualifikationen.dienstjahre_25 ? '<span class="badge badge-success">25J</span> ' : ''}
                        ${app.qualifikationen.dienstjahre_40 ? '<span class="badge badge-success">40J</span> ' : ''}
                        ${!app.qualifikationen.mta_absolviert && !app.qualifikationen.dienstjahre_25 && !app.qualifikationen.dienstjahre_40 ? 
                          '<span class="badge badge-warning">Keine</span>' : ''}
                    </td>
                    <td><small>${new Date(app.timestamp).toLocaleString('de-DE')}</small></td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        <p>🔒 Vertraulich - Nur für interne Verwendung der Feuerwehr Hamberg</p>
        <p>Generiert vom Ehrenamtskarte-System</p>
    </div>
</body>
</html>`;

        await this.uploadFile(
            'data/exports/overview.html',
            html,
            `📊 Update HTML overview - ${applications.length} members`,
            token, owner, repo
        );
    }

    async generateXLSXExport(applications, token, owner, repo) {
        // Note: This would require the XLSX library to be loaded
        // For now, we'll create a detailed CSV that can be opened in Excel
        const detailedCSV = this.generateDetailedCSV(applications);
        
        await this.uploadFile(
            'data/exports/detailed_export.csv',
            detailedCSV,
            `📊 Update detailed Excel-compatible export - ${applications.length} members`,
            token, owner, repo
        );
    }

    generateDetailedCSV(applications) {
        const headers = [
            'Eindeutige ID', 'Anmeldedatum', 'Anmeldezeit',
            'Nachname', 'Vorname', 'Geburtsdatum', 'Alter',
            'E-Mail', 'Telefon',
            'Straße', 'Hausnummer', 'PLZ', 'Ort', 'Vollständige Adresse',
            'MTA absolviert', '25 Jahre Dienst', '40 Jahre Dienst',
            'Anzahl erfüllte Kriterien', 'Qualifikationsstatus',
            'Datenschutz zugestimmt', 'Zugriff verifiziert'
        ];

        const rows = applications.map(app => {
            const date = new Date(app.timestamp);
            const birthDate = new Date(app.person.geburtsdatum);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            const qualCount = [
                app.qualifikationen.mta_absolviert,
                app.qualifikationen.dienstjahre_25,
                app.qualifikationen.dienstjahre_40
            ].filter(Boolean).length;

            return [
                this.generateId(app),
                date.toLocaleDateString('de-DE'),
                date.toLocaleTimeString('de-DE'),
                app.person.nachname || '',
                app.person.vorname || '',
                app.person.geburtsdatum || '',
                age,
                app.person.email || '',
                app.person.telefon || '',
                app.adresse.strasse || '',
                app.adresse.hausnummer || '',
                app.adresse.plz || '',
                app.adresse.ort || '',
                `${app.adresse.strasse} ${app.adresse.hausnummer}, ${app.adresse.plz} ${app.adresse.ort}`,
                app.qualifikationen.mta_absolviert ? 'Ja' : 'Nein',
                app.qualifikationen.dienstjahre_25 ? 'Ja' : 'Nein',
                app.qualifikationen.dienstjahre_40 ? 'Ja' : 'Nein',
                qualCount,
                qualCount > 0 ? 'Berechtigt' : 'Nicht berechtigt',
                app.consent.datenschutz ? 'Ja' : 'Nein',
                app.meta.accessVerified ? 'Ja' : 'Nein'
            ];
        });

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    calculateStatistics(applications) {
        return {
            total: applications.length,
            with_mta: applications.filter(app => app.qualifikationen.mta_absolviert).length,
            with_25_years: applications.filter(app => app.qualifikationen.dienstjahre_25).length,
            with_40_years: applications.filter(app => app.qualifikationen.dienstjahre_40).length,
            qualified: applications.filter(app => 
                app.qualifikationen.mta_absolviert || 
                app.qualifikationen.dienstjahre_25 || 
                app.qualifikationen.dienstjahre_40
            ).length
        };
    }

    generateId(app) {
        const date = new Date(app.timestamp);
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const name = `${app.person.nachname}_${app.person.vorname}`.toLowerCase()
            .replace(/[äöü]/g, char => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' }[char]))
            .replace(/[^a-z]/g, '');
        return `FF_HAM_${dateStr}_${name}`;
    }

    getQualificationSummary(app) {
        const quals = [];
        if (app.qualifikationen.mta_absolviert) quals.push('MTA');
        if (app.qualifikationen.dienstjahre_25) quals.push('25 Jahre');
        if (app.qualifikationen.dienstjahre_40) quals.push('40 Jahre');
        return quals.length > 0 ? quals.join(', ') : 'Keine Qualifikationen';
    }

    async uploadFile(path, content, message, token, owner, repo) {
        try {
            // Check if file already exists to get SHA
            let sha = null;
            try {
                const existingResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=data`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (existingResponse.ok) {
                    const existingData = await existingResponse.json();
                    sha = existingData.sha;
                }
            } catch (error) {
                // File doesn't exist, that's fine
            }

            const encodedContent = btoa(unescape(encodeURIComponent(content)));
            const body = {
                message,
                content: encodedContent,
                branch: 'data'
            };

            if (sha) {
                body.sha = sha;
            }

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log(`✅ ${path} updated successfully`);
        } catch (error) {
            console.error(`❌ Failed to update ${path}:`, error);
            throw error;
        }
    }

    getGitHubToken() {
        const masterToken = window.GITHUB_CONFIG?.masterToken;
        if (masterToken && masterToken !== 'GITHUB_TOKEN_PLACEHOLDER') {
            return masterToken;
        }
        return sessionStorage.getItem('ff_hamberg_github_token');
    }

    getRepoConfig() {
        if (window.GITHUB_CONFIG?.repo) {
            const [owner, repo] = window.GITHUB_CONFIG.repo.split('/');
            return { owner, repo };
        } else {
            return { owner: 'plankl', repo: 'ehrenamtskarte_ff_hamberg_v2' };
        }
    }
}

// Export for use in main script
window.DataExportManager = DataExportManager;