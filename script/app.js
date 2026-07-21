// script/app.js - Centralizador Principal do ValiPro

import { monitorarSessao, realizarLogout } from "./auth.js";
import { escutarProdutos, salvarProduto, excluirProduto } from "./produtos.js";
import { escutarSetores, preencherSelectSetores } from "./setores.js";
import { escutarColaboradores, preencherSelectColaboradores } from "./colaboradores.js";
import { renderizarCards } from "./cards.js";
import { filtrarEOrdenarProdutos } from "./filtros.js";
import { inicializarTema } from "./theme.js";
import { exibirAlerta } from "./notificacoes.js";
import { inicializarScanner } from "./scanner.js";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicia Guarda de Rota / Segurança
    monitorarSessao();

    // Cache de Elementos da DOM
    const btnLogout = document.getElementById('btn-logout');
    const btnThemeToggle = document.getElementById('theme-toggle');
    const cardsContainer = document.getElementById('cards-container');
    const productForm = document.getElementById('product-form');
    
    // Filtros
    const inputBusca = document.getElementById('search-input');
    const selectFiltroSetor = document.getElementById('filter-setor');
    const selectFiltroStatus = document.getElementById('filter-status');
    const selectOrdemData = document.getElementById('order-date');

    // Campos do formulário
    const inputBarcode = document.getElementById('product-barcode');
    const selectSetorForm = document.getElementById('product-setor');
    const selectRespForm = document.getElementById('product-responsible');

    // Variáveis de Estado Local
    let todosProdutos = [];
    let todosSetores = [];
    let todosColaboradores = [];

    // 2. Inicializa o Tema (Claro/Escuro)
    inicializarTema(btnThemeToggle);

    // 3. Listener do Logout
    if (btnLogout) {
        btnLogout.addEventListener('click', realizarLogout);
    }

    // 4. Escuta Setores e atualiza os Selects
    escutarSetores((setores) => {
        todosSetores = setores;
        preencherSelectSetores(selectFiltroSetor, setores, "Todos os Setores");
        preencherSelectSetores(selectSetorForm, setores, "Selecione o Setor");
    });

    // 5. Escuta Colaboradores e atualiza o Select do Formulário
    escutarColaboradores((colaboradores) => {
        todosColaboradores = colaboradores;
        preencherSelectColaboradores(selectRespForm, colaboradores, "Selecione o Responsável");
    });

    // 6. Função para re-aplicar filtros e renderizar a tela
    function atualizarInterface() {
        const texto = inputBusca ? inputBusca.value : '';
        const setor = selectFiltroSetor ? selectFiltroSetor.value : '';
        const status = selectFiltroStatus ? selectFiltroStatus.value : '';
        const ordem = selectOrdemData ? selectOrdemData.value : 'asc';

        const produtosFiltrados = filtrarEOrdenarProdutos(todosProdutos, texto, setor, status, ordem);
        
        renderizarCards(produtosFiltrados, cardsContainer, {
            onExcluir: async (id) => {
                if (confirm('Deseja realmente excluir este produto?')) {
                    try {
                        await excluirProduto(id);
                        exibirAlerta('Produto excluído com sucesso!', 'success');
                    } catch (err) {
                        exibirAlerta('Erro ao excluir produto.', 'error');
                    }
                }
            }
        });
    }

    // 7. Escuta Produtos em tempo real do Firestore
    escutarProdutos((produtos) => {
        todosProdutos = produtos;
        atualizarInterface();
    });

    // 8. Eventos de Filtros e Busca
    [inputBusca, selectFiltroSetor, selectFiltroStatus, selectOrdemData].forEach(elem => {
        if (elem) {
            elem.addEventListener('input', atualizarInterface);
            elem.addEventListener('change', atualizarInterface);
        }
    });

    // 9. Cadastro de Novo Produto
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const novoProduto = {
                codigoBarras: document.getElementById('product-barcode')?.value.trim() || '',
                nome: document.getElementById('product-name')?.value.trim() || '',
                quantidade: Number(document.getElementById('product-quantity')?.value) || 1,
                validade: document.getElementById('product-validity')?.value || '',
                setor: selectSetorForm?.value || '',
                responsavel: selectRespForm?.value || '',
                preco: Number(document.getElementById('product-price')?.value) || 0,
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
            } catch (err) {
                console.error("Erro ao salvar produto:", err);
                exibirAlerta('Erro ao cadastrar o produto.', 'error');
            }
        });
    }

    // 10. Inicializa leitor de código de barras
    inicializarScanner(inputBarcode, (codigo) => {
        exibirAlerta(`Código lido: ${codigo}`, 'info');
    });
});