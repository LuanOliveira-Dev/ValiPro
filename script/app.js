import { initAuth, checkAuthState, setupLogout } from "./auth.js";
import { setupNavigation } from "./dashboard.js";
import { initProdutos } from "./produtos.js";
import { initScanner } from "./scanner.js";
import { initSetores } from "./setores.js";
import { initColaboradores } from "./colaboradores.js";
import { initFavoritos } from "./favoritos.js";
import { initFiltros } from "./filtros.js";
import { initNotificacoes } from "./notificacoes.js";
import { initTheme } from "./theme.js";

document.addEventListener('DOMContentLoaded', () => {
    // Inicialização da Autenticação
    initAuth();
    checkAuthState();
    setupLogout();

    // Inicialização dos Módulos do Painel
    setupNavigation();
    initProdutos();
    initScanner();
    initSetores();
    initColaboradores();
    initFavoritos();
    initFiltros();
    initNotificacoes();
    initTheme();
});