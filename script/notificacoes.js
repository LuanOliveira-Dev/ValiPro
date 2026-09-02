export function initNotificacoes() {
    const badge = document.getElementById('count-notif-badge');
    if (badge) {
        // Exemplo de atribuição dinamica
        badge.textContent = "3";
    }
}