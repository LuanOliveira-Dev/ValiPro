// js/cards.js
import { calcularDiasRestantes, obterStatusVencimento, formatarDataBR, formatarMoeda } from "./utils.js";

// Função principal que renderiza a lista de produtos na grid do painel
export function renderizarCards(produtos, containerElement, acoes = {}) {
    if (!containerElement) return;

    if (!produtos || produtos.length === 0) {
        containerElement.innerHTML = `
            <div class="empty-state">
                <p>Nenhum produto encontrado para este filtro.</p>
            </div>
        `;
        return;
    }

    containerElement.innerHTML = '';

    produtos.forEach(produto => {
        const diasRestantes = calcularDiasRestantes(produto.validade);
        const status = obterStatusVencimento(diasRestantes);

        const card = document.createElement('div');
        card.className = `card-produto status-${status.classe}`;
        card.dataset.id = produto.id;

        card.innerHTML = `
            <div class="card-header">
                <span class="badge badge-${status.classe}">${status.texto}</span>
                <span class="dias-restantes">${diasRestantes < 0 ? `${Math.abs(diasRestantes)} dia(s) atrás` : `${diasRestantes} dia(s)`}</span>
            </div>
            <div class="card-body">
                <h3 class="produto-nome">${produto.nome || 'Produto sem nome'}</h3>
                <p class="produto-barras"><strong>EAN:</strong> ${produto.codigoBarras || 'N/A'}</p>
                <p class="produto-setor"><strong>Setor:</strong> ${produto.setor || 'Não definido'}</p>
                <p class="produto-validade"><strong>Validade:</strong> ${formatarDataBR(produto.validade)}</p>
                <p class="produto-qtd"><strong>Qtd:</strong> ${produto.quantidade || 0} un</p>
                ${produto.preco ? `<p class="produto-preco"><strong>Preço:</strong> ${formatarMoeda(produto.preco)}</p>` : ''}
                ${produto.responsavel ? `<p class="produto-resp"><strong>Resp:</strong> ${produto.responsavel}</p>` : ''}
            </div>
            <div class="card-actions">
                <button class="btn-delete" data-id="${produto.id}" title="Excluir Produto">
                    🗑️ Excluir
                </button>
            </div>
        `;

        // Evento do botão excluir dentro do card
        const btnDelete = card.querySelector('.btn-delete');
        if (btnDelete && acoes.onExcluir) {
            btnDelete.addEventListener('click', () => acoes.onExcluir(produto.id));
        }

        containerElement.appendChild(card);
    });
}