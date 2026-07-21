// js/utils.js

// Formata data ISO (YYYY-MM-DD) para padrão BR (DD/MM/YYYY)
export function formatarDataBR(dataIso) {
    if (!dataIso) return '--/--/----';
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Calcula os dias restantes até o vencimento
export function calcularDiasRestantes(dataVencimento) {
    if (!dataVencimento) return null;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const vencimento = new Date(dataVencimento + 'T00:00:00');
    
    const diferencaMs = vencimento - hoje;
    return Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
}

// Define a classe CSS/status com base nos dias restantes
export function obterStatusVencimento(dias) {
    if (dias < 0) return { texto: 'Vencido', classe: 'vencido' };
    if (dias <= 7) return { texto: 'Urgente', classe: 'critico' };
    if (dias <= 30) return { texto: 'Atenção', classe: 'atencao' };
    return { texto: 'OK', classe: 'ok' };
}

// Formata valor para Moeda Brasileira (R$)
export function formatarMoeda(valor) {
    const numero = Number(valor) || 0;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}