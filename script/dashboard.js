import { stopScanner } from "./scanner.js";
import { renderAVencerTable } from "./produtos.js";

export function setupNavigation() {
    const viewDashboard = document.getElementById('view-dashboard');
    const viewAddProduct = document.getElementById('view-add-product');
    const viewColetados = document.getElementById('view-coletados');
    const viewDatabase = document.getElementById('view-database');
    const viewAVencer = document.getElementById('view-avencer');
    const viewSetor = document.getElementById('view-setor');
    const viewColaborador = document.getElementById('view-colaborador');
    const viewConfiguracao = document.getElementById('view-configuracao');

    const btnCardAdicionar = document.getElementById('btn-card-adicionar');
    const btnCardDatabase = document.getElementById('btn-card-database');
    const btnCardColetados = document.getElementById('btn-card-coletados');
    const btnCardAVencer = document.getElementById('btn-card-avencer');
    const btnCardSetor = document.getElementById('btn-card-setor');
    const btnCardColaborador = document.getElementById('btn-card-colaborador');
    const btnCardConfig = document.getElementById('btn-card-config');

    const btnBack = document.getElementById('btn-back');
    const btnHome = document.getElementById('btn-home');

    const dashboardMainTitle = document.getElementById('dashboard-main-title');
    const dashboardSubtitle = document.getElementById('dashboard-subtitle');
    const productBarcodeInput = document.getElementById('product-barcode');

    function hideAllTabs() {
        if (viewDashboard) viewDashboard.classList.add('hidden');
        if (viewAddProduct) viewAddProduct.classList.add('hidden');
        if (viewDatabase) viewDatabase.classList.add('hidden');
        if (viewColetados) viewColetados.classList.add('hidden');
        if (viewAVencer) viewAVencer.classList.add('hidden');
        if (viewSetor) viewSetor.classList.add('hidden');
        if (viewColaborador) viewColaborador.classList.add('hidden');
        if (viewConfiguracao) viewConfiguracao.classList.add('hidden');
    }

    function showDashboardTab() {
        stopScanner();
        hideAllTabs();
        if (viewDashboard) viewDashboard.classList.remove('hidden');
        if (btnBack) btnBack.classList.add('hidden');
        if (dashboardMainTitle) dashboardMainTitle.textContent = "Painel Geral";
        if (dashboardSubtitle) dashboardSubtitle.textContent = "Painel Geral de Monitoramento";
    }

    function showTab(view, title, subtitle, focusInput = null) {
        hideAllTabs();
        if (view) view.classList.remove('hidden');
        if (btnBack) btnBack.classList.remove('hidden');
        if (dashboardMainTitle) dashboardMainTitle.textContent = title;
        if (dashboardSubtitle) dashboardSubtitle.textContent = subtitle;
        if (focusInput) focusInput.focus();
    }

    if (btnCardAdicionar) btnCardAdicionar.addEventListener('click', () => showTab(viewAddProduct, "Adicionar Produto", "Adicionar Produto ao Estoque", productBarcodeInput));
    if (btnCardDatabase) btnCardDatabase.addEventListener('click', () => showTab(viewDatabase, "Gerenciamento de Nuvem", "Gerenciamento de Nuvem e Integração"));
    if (btnCardColetados) btnCardColetados.addEventListener('click', () => showTab(viewColetados, "Produtos Coletados", "Produtos Coletados / Lista Geral"));
    if (btnCardAVencer) btnCardAVencer.addEventListener('click', () => {
        showTab(viewAVencer, "Produtos Críticos", "Produtos Críticos - Vencimento Próximo");
        renderAVencerTable();
    });
    if (btnCardSetor) btnCardSetor.addEventListener('click', () => showTab(viewSetor, "Gerenciar Setores", "Gerenciar e Cadastrar Setores da Loja"));
    if (btnCardColaborador) btnCardColaborador.addEventListener('click', () => showTab(viewColaborador, "Gerenciar Colaboradores", "Gerenciar e Cadastrar Colaboradores da Loja"));
    if (btnCardConfig) btnCardConfig.addEventListener('click', () => showTab(viewConfiguracao, "Configurações", "Configurações do Painel"));

    if (btnBack) btnBack.addEventListener('click', showDashboardTab);
    if (btnHome) btnHome.addEventListener('click', showDashboardTab);
}