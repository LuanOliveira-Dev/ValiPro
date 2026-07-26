// script/app.js - Centralizador Principal do ValiPro

import { monitorarSessao, realizarLogout } from "./auth.js";
import { escutarProdutos, salvarProduto, excluirProduto } from "./produtos.js";
import { escutarSetores, preencherSelectSetores } from "./setores.js";
import { escutarColaboradores, preencherSelectColaboradores } from "./colaboradores.js";
import { renderizarCards } from "./cards.js";
import { exibirAlerta } from "./notificacoes.js";
import { inicializarScanner } from "./scanner.js";
import { formatarDataBR } from "./utils.js";

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

    // Esconde todas as views secundárias
    todasViews.forEach(v => v.classList.add('hidden'));

    if (idView === 'view-dashboard' || idView === 'dashboard') {
        if (gridDashboard) gridDashboard.classList.remove('hidden');
        if (btnBack) btnBack.classList.add('hidden');
    } else {
        if (gridDashboard) gridDashboard.classList.add('hidden');
        const viewAlvo = document.getElementById(idView);
        if (viewAlvo) {
            viewAlvo.classList.remove('hidden');
        }
        if (btnBack) btnBack.classList.remove('hidden');
    }
}

// -------------------------------------------------------------
// RENDERIZADOR DE TABELA (PARA A TELA DA SUA IMAGEM)
// -------------------------------------------------------------
function renderizarTabelaProdutos(produtos, tableBodyElement) {
    if (!tableBodyElement) return;

    if (!produtos || produtos.length === 0) {
        tableBodyElement.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">Nenhum produto cadastrado.</td>
            </tr>
        `;
        return;
    }

    tableBodyElement.innerHTML = produtos.map(p => `
        <tr>
            <td>${p.codigoBarras || 'N/A'}</td>
            <td><strong>${p.nome || 'Sem nome'}</strong></td>
            <td>${p.setor || 'Geral'}</td>
            <td>${p.quantidade || 0}</td>
            <td>${p.validade ? (formatarDataBR ? formatarDataBR(p.validade) : p.validade) : 'N/A'}</td>
            <td>
                <button onclick="window.excluirProdutoGlobal('${p.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;" title="Excluir">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

// -------------------------------------------------------------
// INICIALIZAÇÃO DO DOM
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    monitorarSessao();

    // Elementos principais
    const btnLogout = document.getElementById('btn-logout');
    const btnHome = document.getElementById('btn-home');
    const btnBack = document.getElementById('btn-back');
    const cardsContainer = document.getElementById('cards-container');
    const productForm = document.getElementById('product-form');

    // Tabela da tela "Lista de Produtos Coletados"
    const tabelaColetados = document.querySelector('#view-coletados tbody') || 
                             document.querySelector('table tbody') || 
                             document.getElementById('table-coletados-body');

    // Mapeia cliques nos Cards do Dashboard
    const todosOsCards = document.querySelectorAll('.card, .card-dash, [id^="btn-card-"]');
    
    todosOsCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const id = card.id;
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
                const targetView = card.getAttribute('data-target');
                if (targetView) navegarPara(targetView);
            }
        });
    });

    // Navegação do Topo
    if (btnHome) btnHome.addEventListener('click', () => navegarPara('view-dashboard'));
    if (btnBack) btnBack.addEventListener('click', () => navegarPara('view-dashboard'));
    if (btnLogout) btnLogout.addEventListener('click', realizarLogout);

    // Formulários
    const selectSetorForm = document.getElementById('product-sector') || document.getElementById('product-setor');
    const selectFiltroSetor = document.getElementById('filter-setor');

    let todosProdutos = [];

    // Carrega Setores
    escutarSetores((setores) => {
        const listaSetores = setores || [];
        if (selectFiltroSetor) preencherSelectSetores(selectFiltroSetor, listaSetores, "Todos os Setores");
        if (selectSetorForm) preencherSelectSetores(selectSetorForm, listaSetores, "Selecione um Setor");
    });

    // Carrega Produtos em Tempo Real do Firestore
    escutarProdutos((produtos) => {
        todosProdutos = produtos || [];
        
        // Contadores dos Cards
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

        // Renderiza na Tabela da tela "Lista de Produtos Coletados"
        if (tabelaColetados) {
            renderizarTabelaProdutos(todosProdutos, tabelaColetados);
        }

        // Renderiza em Cards no container genérico (se existir)
        if (cardsContainer) {
            renderizarCards(todosProdutos, cardsContainer, {
                onExcluir: window.excluirProdutoGlobal
            });
        }
    });

    // Submissão do Formulário
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

    // Leitor de Código de Barras
    const inputBarcode = document.getElementById('product-barcode');
    if (inputBarcode) {
        inicializarScanner(inputBarcode, (codigo) => {
            exibirAlerta(`Código lido: ${codigo}`, 'info');
        });
    }
});
