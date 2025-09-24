// GitHub Configuration - Placeholder (will be replaced during deployment)
window.GITHUB_CONFIG = {
    token: 'GITHUB_TOKEN_PLACEHOLDER', // Will be replaced by GitHub Actions
    repoOwner: 'plankl',
    repoName: 'ehrenamtskarte_ff_hamberg_v2',
    dataBranch: 'data',
    dataFolder: 'data',
    accessPassword: 'FEUERWEHR_ACCESS_PASSWORD_PLACEHOLDER', // Will be replaced during deployment
    isDevelopment: true // This flag helps reduce development warnings
};

console.log('📁 Local config.js loaded - deployment will override if token is configured');