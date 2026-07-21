// js/notificacoes.js

export function exibirAlerta(mensagem, tipo = 'info', containerId = 'alert-box') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.className = `alert alert-${tipo}`;
    
    const alertMessage = container.querySelector('#alert-message') || container;
    alertMessage.textContent = mensagem;

    container.classList.remove('hidden');

    // Auto-oculta após 4 segundos se for mensagem de sucesso/info
    if (tipo === 'success' || tipo === 'info') {
        setTimeout(() => {
            container.classList.add('hidden');
        }, 4000);
    }
}