// Debug Test Script
console.log('🔧 Debug Test Script geladen');

// Test Theme Toggle
function testThemeToggle() {
    console.log('🎨 Theme Toggle Test');
    const btn = document.getElementById('themeToggle');
    console.log('Theme Button:', btn);
    if (btn) {
        btn.click();
        console.log('✅ Theme Toggle geklickt');
    }
}

// Test Tab System  
function testTabs() {
    console.log('📂 Tab System Test');
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    console.log('Tab Buttons:', tabs);
    console.log('Tab Contents:', contents);
    
    // Test Info Tab
    const infoBtn = document.querySelector('[data-tab="info"]');
    if (infoBtn) {
        infoBtn.click();
        console.log('✅ Info Tab geklickt');
    }
}

// Auto-test after page load
setTimeout(() => {
    console.log('🚀 Auto-Test startet...');
    testThemeToggle();
    setTimeout(() => testTabs(), 1000);
}, 2000);