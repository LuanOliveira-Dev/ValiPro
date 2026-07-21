// js/scanner.js

// Prepara e escuta eventos de bipagem/scanner de código de barras
export function inicializarScanner(inputElement, onScanCallback) {
    if (!inputElement) return;

    let buffer = '';
    let timeout = null;

    // Escuta entradas rápidas de leitores de código de barras USB/Bluetooth
    window.addEventListener('keypress', (e) => {
        // Se o foco estiver num campo numérico normal, ignora a escuta global
        if (document.activeElement.tagName === 'INPUT' && document.activeElement !== inputElement) {
            return;
        }

        if (e.key === 'Enter') {
            if (buffer.length > 3) {
                inputElement.value = buffer;
                if (onScanCallback) onScanCallback(buffer);
            }
            buffer = '';
        } else {
            buffer += e.key;
            clearTimeout(timeout);
            timeout = setTimeout(() => { buffer = ''; }, 200);
        }
    });
}