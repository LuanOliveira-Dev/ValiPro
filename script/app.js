// script/app.js - Centralizador Principal do ValiPro

import { monitorarSessao, realizarLogout } from "./auth.js";
import { escutarProdutos, salvarProduto, excluirProduto } from "./produtos.js";
import { escutarSetores, preencherSelectSetores } from "./setores.js";
import { escutarColaboradores, preencherSelectColaboradores } from "./colaboradores.js";
import { renderizarCards } from "./cards.js";
import { exibirAlerta } from "./notificacoes.js";
import { inicializarScanner } from "./scanner.js";

// -------------------------------------------------------------
// EXPOSIÇÃO GLOBAL
// -------------------------------------------------------------
window.realizarLogout = realizarLogout;

window.excluirProdutoGlobal = async function(id) {
    if (confirm('Deseja realmente excluir este produto?')) {
        try {
            await excluirProduto(id);
            exibirAlerta('Produto excluído com sucesso!', 'success');
        } catch (err) {
            console.error("Erro ao excluir:", err);
            exibirAlerta('Erro ao excluir produto.', 'error');
        }
    }
};

// -------------------------------------------------------------
// NAVEGAÇÃO ENTRE AS TELAS/VIEWS DO PAINEL
// -------------------------------------------------------------
function navegarPara(idView) {
    const gridDashboard = document.getElementById('view-dashboard') || document.querySelector('.dashboard-container') || document.querySelector('.dashboard-grid');
    const todasViews = document.querySelectorAll('.page-content');
    const btnBack = document.getElementById('btn-back');

    if (!idView) return;

    // Esconde todas as páginas secundárias
    todasViews.forEach(v => v.classList.add('hidden'));

    if (idView === 'view-dashboard' || idView === 'dashboard') {
        if (gridDashboard) gridDashboard.classList.remove('hidden');
        if (btnBack) btnBack.classList.add('hidden');
    } else {
        if (gridDashboard) gridDashboard.classList.add('hidden');
        const viewAlvo = document.getElementById(idView);
        if (viewAlvo) {
            viewAlvo.classList.remove('hidden');
        } else {
            console.warn(`A view com id "${idView}" não foi encontrada no HTML.`);
        }
        if (btnBack) btnBack.classList.remove('hidden');
    }
}

// -------------------------------------------------------------
// INICIALIZAÇÃO E EVENTOS DO DOM
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Guarda de Rota (Segurança)
    monitorarSessao();

    // Cache de Elementos da DOM
    const btnLogout = document.getElementById('btn-logout');
    const btnHome = document.getElementById('btn-home');
    const btnBack = document.getElementById('btn-back');
    const cardsContainer = document.getElementById('cards-container');
    const productForm = document.getElementById('product-form');

    // 2. Escuta cliques em TODOS os cards do Dashboard (dinâmico)
    const todosOsCards = document.querySelectorAll('.card, .card-dash, [id^="btn-card-"]');
    
    todosOsCards.forEach(card => {
        card.style.cursor = 'pointer'; // Garante o ponteiro de clique
        
        card.addEventListener('click', (e) => {
            const id = card.id;
            
            // Mapeia o ID do card para a View correspondente
            if (id.includes('adicionar') || id.includes('add')) navegarPara('view-add-product');
            else if (id.includes('avencer')) navegarPara('view-avencer');
            else if (id.includes('coletados') || id.includes('conferidos')) navegarPara('view-coletados');
            else if (id.includes('setor')) navegarPara('view-setor');
            else if (id.includes('colaborador')) navegarPara('view-colaborador');
            else if (id.includes('config')) navegarPara('view-configuracao');
            else if (id.includes('database')) navegarPara('view-database');
            else if (id.includes('fornecedor')) navegarPara('view-fornecedor');
            else if (id.includes('estatistica')) navegarPara('view-estatistica');
            else if (id.includes('excluidos')) navegarPara('view-excluidos');
            else {
                // Tenta abrir direto pelo ID do target se existir no card
                const targetView = card.getAttribute('data-target');
                if (targetView) navegarPara(targetView);
            }
        });
    });

    // Botões de Navegação do Topo
    if (btnHome) btnHome.addEventListener('click', () => navegarPara('view-dashboard'));
    if (btnBack) btnBack.addEventListener('click', () => navegarPara('view-dashboard'));
    if (btnLogout) btnLogout.addEventListener('click', realizarLogout);

    // Campos do formulário
    const selectSetorForm = document.getElementById('product-sector') || document.getElementById('product-setor');
    const selectFiltroSetor = document.getElementById('filter-setor');

    // Estado Local
    let todosProdutos = [];

    // Escuta Setores
    escutarSetores((setores) => {
        const listaSetores = setores || [];
        if (selectFiltroSetor) preencherSelectSetores(selectFiltroSetor, listaSetores, "Todos os Setores");
        if (selectSetorForm) preencherSelectSetores(selectSetorForm, listaSetores, "Selecione um Setor");
    });

    // Escuta Colaboradores
    escutarColaboradores(() => {});

    // Escuta Produtos em tempo real do Firestore
    escutarProdutos((produtos) => {
        todosProdutos = produtos || [];
        
        // Atualiza contadores dos cards na tela
        const countAvencer = document.getElementById('count-avencer');
        const countColetados = document.getElementById('count-coletados') || document.getElementById('count-conferidos');
        const countCloud = document.getElementById('count-cloud') || document.getElementById('count-database');

        if (countAvencer) {
            const prestesAVencer = todosProdutos.filter(p => {
                if (!p.validade) return false;
                const diff = (new Date(p.validade) - new Date()) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 10;
            });
            countAvencer.textContent = prestesAVencer.length;
        }

        if (countColetados) countColetados.textContent = todosProdutos.length;
        if (countCloud) countCloud.textContent = todosProdutos.length;

        if (cardsContainer) {
            renderizarCards(todosProdutos, cardsContainer, {
                onExcluir: window.excluirProdutoGlobal
            });
        }
    });

    // Submissão do Formulário de Adicionar Produto
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const novoProduto = {
                codigoBarras: document.getElementById('product-barcode')?.value.trim() || '',
                nome: document.getElementById('product-name')?.value.trim() || '',
                quantidade: Number(document.getElementById('product-quantity')?.value) || 1,
                validade: (document.getElementById('product-expiry') || document.getElementById('product-validity'))?.value || '',
                setor: selectSetorForm?.value || '',
                criadoEm: new Date().toISOString()
            };

            if (!novoProduto.nome || !novoProduto.validade) {
                exibirAlerta('Preencha pelo menos o Nome e a Data de Validade!', 'error');
                return;
            }

            try {
                await salvarProduto(novoProduto);
                productForm.reset();
                exibirAlerta('Produto cadastrado com sucesso!', 'success');
                navegarPara('view-dashboard');
            } catch (err) {
                console.error("Erro ao salvar produto:", err);
                exibirAlerta('Erro ao cadastrar o produto.', 'error');
            }
        });
    }

    // Scanner
    const inputBarcode = document.getElementById('product-barcode');
    if (inputBarcode) {
        inicializarScanner(inputBarcode, (codigo) => {
            exibirAlerta(`Código lido: ${codigo}`, 'info');
        });
    }
});
