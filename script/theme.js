import { renderTable, renderAVencerTable } from "./produtos.js";

export function initTheme() {
    const btnToggleTheme = document.getElementById('btn-toggle-theme');
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    if (btnToggleTheme) {
        btnToggleTheme.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
            renderTable();
            renderAVencerTable();
        });
    }
}