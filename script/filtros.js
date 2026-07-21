// js/filtros.js
import { calcularDiasRestantes } from "./utils.js";

// Aplica todos os filtros e ordenações na lista original de produtos
export function filtrarEOrdenarProdutos(produtos, filtroTexto = '', filtroSetor = '', filtroStatus = '', ordemData = 'asc') {
    if (!produtos) return [];

    return produtos.filter(produto => {
        // Filtro por nome ou código de barras
        const termo = filtroTexto.toLowerCase().trim();
        const nomeMatch = (produto.nome || '').toLowerCase().includes(termo);
        const barrasMatch = (produto.codigoBarras || '').includes(termo);
        const passaTexto = !termo || nomeMatch || barrasMatch;

        // Filtro por setor
        const passaSetor = !filtroSetor || produto.setor === filtroSetor;

        // Filtro por status de vencimento
        const dias = calcularDiasRestantes(produto.validade);
        let passaStatus = true;
        if (filtroStatus === 'vencido') passaStatus = dias < 0;
        else if (filtroStatus === 'critico') passaStatus = dias >= 0 && dias <= 7;
        else if (filtroStatus === 'atencao') passaStatus = dias > 7 && dias <= 30;
        else if (filtroStatus === 'ok') passaStatus = dias > 30;

        return passaTexto && passaSetor && passaStatus;
    }).sort((a, b) => {
        // Ordenação por data de validade
        const dataA = new Date(a.validade || '9999-12-31');
        const dataB = new Date(b.validade || '9999-12-31');

        return ordemData === 'asc' ? dataA - dataB : dataB - dataA;
    });
}