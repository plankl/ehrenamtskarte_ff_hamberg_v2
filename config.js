// GitHub Configuration - Placeholder (will be replaced during deployment)
window.GITHUB_CONFIG = {
    token: 'GITHUB_TOKEN_PLACEHOLDER', // Will be replaced by GitHub Actions
    repoOwner: 'plankl',
    repoName: 'ehrenamtskarte_ff_hamberg_v2',
    dataBranch: 'data',
    dataFolder: 'data',
    accessPassword: 'FEUERWEHR_ACCESS_PASSWORD_PLACEHOLDER' // Will be replaced during deployment
};
window.GITHUB_CONFIG = window.GITHUB_CONFIG || {
    tokenConfigured: false,
    token: 'GITHUB_TOKEN_PLACEHOLDER'
};

console.log('📁 Local config.js loaded - deployment will override if token is configured');