// script/app.js - Centralizador Principal do ValiPro

import { monitorarSessao, realizarLogout } from "./auth.js";
import { escutarProdutos, salvarProduto, excluirProduto } from "./produtos.js";
import { escutarSetores, preencherSelectSetores } from "./setores.js";
import { escutarColaboradores, preencherSelectColaboradores } from "./colaboradores.js";
import { renderizarCards } from "./cards.js";
import { filtrarEOrdenarProdutos } from "./filtros.js";
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
// NAVEGAÇÃO DE VIEWS / MÓDULOS
// -------------------------------------------------------------
function navegarPara(idView) {
    const gridDashboard = document.getElementById('view-dashboard');
    const todasViews = document.querySelectorAll('.page-content');
    const btnBack = document.getElementById('btn-back');

    // Esconde todas as páginas secundárias
    todasViews.forEach(v => v.classList.add('hidden'));

    if (idView === 'view-dashboard') {
        if (gridDashboard) gridDashboard.classList.remove('hidden');
        if (btnBack) btnBack.classList.add('hidden');
    } else {
        if (gridDashboard) gridDashboard.classList.add('hidden');
        const viewAlvo = document.getElementById(idView);
        if (viewAlvo) viewAlvo.classList.remove('hidden');
        if (btnBack) btnBack.classList.remove('hidden');
    }
}

// -------------------------------------------------------------
// INICIALIZAÇÃO E EVENTOS DO DOM
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Guarda de Rota
    monitorarSessao();

    // Cache de Elementos da DOM
    const btnLogout = document.getElementById('btn-logout');
    const btnHome = document.getElementById('btn-home');
    const btnBack = document.getElementById('btn-back');
    const cardsContainer = document.getElementById('cards-container');
    const productForm = document.getElementById('product-form');

    // Mapeamento dos Cards para Navegação
    const mapeamentoCards = {
        'btn-card-adicionar': 'view-add-product',
        'btn-card-coletados': 'view-coletados',
        'btn-card-avencer': 'view-avencer',
        'btn-card-setor': 'view-setor',
        'btn-card-colaborador': 'view-colaborador',
        'btn-card-config': 'view-configuracao',
        'btn-card-database': 'view-database'
    };

    // Atribui os cliques nos cards do Dashboard
    Object.keys(mapeamentoCards).forEach(cardId => {
        const cardElem = document.getElementById(cardId);
        if (cardElem) {
            cardElem.addEventListener('click', () => {
                navegarPara(mapeamentoCards[cardId]);
            });
        }
    });

    // Botões de Topo / Navegação
    if (btnHome) btnHome.addEventListener('click', () => navegarPara('view-dashboard'));
    if (btnBack) btnBack.addEventListener('click', () => navegarPara('view-dashboard'));
    if (btnLogout) btnLogout.addEventListener('click', realizarLogout);

    // Campos do formulário de Produto
    const selectSetorForm = document.getElementById('product-sector');
    const selectFiltroSetor = document.getElementById('filter-setor');

    // Variáveis de Estado Local
    let todosProdutos = [];
    let todosSetores = [];
    let todosColaboradores = [];

    // Escuta Setores e atualiza Selects
    escutarSetores((setores) => {
        todosSetores = setores || [];
        if (selectFiltroSetor) preencherSelectSetores(selectFiltroSetor, todosSetores, "Todos os Setores");
        if (selectSetorForm) preencherSelectSetores(selectSetorForm, todosSetores, "Selecione um Setor");
    });

    // Escuta Colaboradores
    escutarColaboradores((colaboradores) => {
        todosColaboradores = colaboradores || [];
    });

    // Escuta Produtos em tempo real
    escutarProdutos((produtos) => {
        todosProdutos = produtos || [];
        
        // Atualiza contadores dos cards
        const countAvencer = document.getElementById('count-avencer');
        const countColetados = document.getElementById('count-coletados');
        const countCloud = document.getElementById('count-cloud');

        if (countAvencer) countAvencer.textContent = todosProdutos.filter(p => {
            const diff = (new Date(p.validade) - new Date()) / (1000 * 60 * 60 * 24);
            return diff >= 0 && diff <= 10;
        }).length;

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
                validade: document.getElementById('product-expiry')?.value || '',
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

    // Leitor de código de barras
    const inputBarcode = document.getElementById('product-barcode');
    if (inputBarcode) {
        inicializarScanner(inputBarcode, (codigo) => {
            exibirAlerta(`Código lido: ${codigo}`, 'info');
        });
    }
});
