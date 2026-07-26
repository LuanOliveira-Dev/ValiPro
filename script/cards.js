export function updateCounters(products = []) {
    const countAVencer = document.getElementById('count-avencer');
    const countVencidos = document.getElementById('count-vencidos');
    const countConferidos = document.getElementById('count-conferidos');
    const countColetados = document.getElementById('count-coletados');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let vencidos = 0;
    let aVencer = 0;

    products.forEach(p => {
        const expDate = new Date(p.expiry + 'T00:00:00');
        if (expDate < today) {
            vencidos++;
        } else {
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 10) aVencer++;
        }
    });

    const total = products.length;
    if (countAVencer) countAVencer.textContent = aVencer;
    if (countVencidos) countVencidos.textContent = vencidos;
    if (countConferidos) countConferidos.textContent = total;
    if (countColetados) countColetados.textContent = total;
}