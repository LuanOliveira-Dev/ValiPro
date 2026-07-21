// js/theme.js

const THEME_KEY = 'valipro_theme';

// Inicializa o tema salvo ou usa o padrão do sistema
export function inicializarTema(btnToggle) {
    const temaSalvo = localStorage.getItem(THEME_KEY) || 'light';
    aplicarTema(temaSalvo);

    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            const temaAtual = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            const novoTema = temaAtual === 'light' ? 'dark' : 'light';
            aplicarTema(novoTema);
            localStorage.setItem(THEME_KEY, novoTema);
        });
    }
}

function aplicarTema(tema) {
    if (tema === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}