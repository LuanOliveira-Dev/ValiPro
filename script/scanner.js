import { buscarProdutoPorCodigo } from "./produtos.js";

let html5QrcodeScanner = null;

export function initScanner() {
    const btnScan = document.getElementById('btn-scan');
    const btnStopScan = document.getElementById('btn-stop-scan');
    const scannerWrapper = document.getElementById('scanner-wrapper');
    const productBarcodeInput = document.getElementById('product-barcode');

    if (btnScan) {
        btnScan.addEventListener('click', () => {
            scannerWrapper.classList.remove('hidden');
            html5QrcodeScanner = new Html5Qrcode("reader");
            const config = { fps: 10, qrbox: { width: 300, height: 150 } };
            
            html5QrcodeScanner.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    productBarcodeInput.value = decodedText;
                    stopScanner();
                    buscarProdutoPorCodigo(decodedText);
                },
                () => {}
            ).catch(err => {
                alert("Erro ao acessar a câmera: " + err);
                stopScanner();
            });
        });
    }

    if (btnStopScan) {
        btnStopScan.addEventListener('click', stopScanner);
    }
}

export function stopScanner() {
    const scannerWrapper = document.getElementById('scanner-wrapper');
    if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop().then(() => {
            if (scannerWrapper) scannerWrapper.classList.add('hidden');
        }).catch(err => console.log(err));
    } else {
        if (scannerWrapper) scannerWrapper.classList.add('hidden');
    }
}