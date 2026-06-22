// --- SECURED JAVASCRIPT INTERACTIVITY CONTROL LAYER ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Theme Switcher with Strict Validation
    const themeBtn = document.getElementById('theme-btn');
    
    // Default validation from localStorage
    const savedTheme = localStorage.getItem('theme');
    const validThemes = ['light', 'dark'];
    
    // Only apply if the data is exactly what we expect (Strict Whitelisting)
    if (savedTheme && validThemes.includes(savedTheme)) {
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    // Defensive Check: Execute only if button exists on the current page
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // 2. Mobile Navigation with Null-Safe Protection
    const menuBtn = document.getElementById('menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents event from bubbling up to document unnecessarily
            navMenu.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });

        // Global click observer with strict encapsulation
        document.addEventListener('click', (e) => {
            // Secure check ensuring elements are fully mounted before testing boundaries
            if (menuBtn && navMenu) {
                if (!menuBtn.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    menuBtn.classList.remove('active');
                }
            }
        });
    }
});