import { produtosCollection, catalogoCollection, db } from "./firebase.js";
import { addDoc, onSnapshot, deleteDoc, doc, writeBatch, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { updateCounters } from "./cards.js";
import { getCurrentSectorFilter } from "./filtros.js";

export let localProducts = [];
export let localCatalogo = [];

export function initProdutos() {
    const productForm = document.getElementById('product-form');
    const productBarcodeInput = document.getElementById('product-barcode');
    const productNameInput = document.getElementById('product-name');
    const productQuantityInput = document.getElementById('product-quantity');
    const productExpiryInput = document.getElementById('product-expiry');
    const productSectorInput = document.getElementById('product-sector');
    const csvFileInput = document.getElementById('csv-file-input');
    const countCloud = document.getElementById('count-cloud');
    const panelCloudCounter = document.getElementById('panel-cloud-counter');

    // Escuta em tempo real os produtos coletados
    onSnapshot(produtosCollection, (snapshot) => {
        localProducts = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            localProducts.push({
                id: docSnap.id,
                barcode: data.barcode || '',
                name: data.name || '',
                quantity: data.quantity || '1',
                expiry: data.expiry || '',
                sector: data.sector || ''
            });
        });
        renderTable();
        renderAVencerTable();
        updateCounters(localProducts);
    });

    // Escuta em tempo real o catálogo de produtos na nuvem
    onSnapshot(catalogoCollection, (snapshot) => {
        localCatalogo = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            localCatalogo.push({
                barcode: String(data.barcode || '').trim(),
                name: String(data.name || '').trim()
            });
        });
        const totalCatalogo = localCatalogo.length;
        if (countCloud) countCloud.textContent = totalCatalogo;
        if (panelCloudCounter) panelCloudCounter.textContent = `${totalCatalogo} PRODUTOS NA NUVEM`;
    });

    // Auto-preenchimento ao digitar ou escanear o código
    if (productBarcodeInput) {
        productBarcodeInput.addEventListener('blur', () => buscarProdutoPorCodigo(productBarcodeInput.value));
        productBarcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarProdutoPorCodigo(productBarcodeInput.value);
            }
        });
    }

    // Adicionar Produto
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const barcode = productBarcodeInput.value.trim();
            const name = productNameInput.value.trim();
            const quantity = parseInt(productQuantityInput.value) || 1;
            const expiry = productExpiryInput.value;
            const sector = productSectorInput.value;

            if (name && expiry && sector) {
                try {
                    await addDoc(produtosCollection, { barcode, name, quantity, expiry, sector });
                    productBarcodeInput.value = '';
                    productNameInput.value = '';
                    productExpiryInput.value = '';
                    if (productQuantityInput) productQuantityInput.value = "";
                    productBarcodeInput.focus();
                } catch (err) {
                    alert("Erro ao salvar produto: " + err.message);
                }
            }
        });
    }

    // Importação de CSV para a Nuvem
    if (csvFileInput) {
        csvFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async function(event) {
                    const text = event.target.result;
                    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                    let batch = writeBatch(db);
                    let countInBatch = 0;
                    let totalImportados = 0;

                    for (let index = 1; index < lines.length; index++) {
                        const line = lines[index];
                        const columns = line.includes(';') ? line.split(';') : line.split(',');
                        if (columns.length >= 2) {
                            const barcode = columns[0]?.replace(/"/g, '').trim() || '';
                            const name = columns[1]?.replace(/"/g, '').trim() || '';

                            if (barcode && name) {
                                const docRef = doc(collection(db, "catalogo"));
                                batch.set(docRef, { barcode, name });
                                countInBatch++;
                                totalImportados++;

                                if (countInBatch === 400) {
                                    await batch.commit();
                                    batch = writeBatch(db);
                                    countInBatch = 0;
                                }
                            }
                        }
                    }

                    if (countInBatch > 0) await batch.commit();
                    if (totalImportados > 0) {
                        alert(`Sucesso! ${totalImportados} produtos salvos na nuvem.`);
                        csvFileInput.value = "";
                    } else {
                        alert("Não foi possível ler os produtos. Verifique a estrutura do CSV.");
                    }
                };
                reader.readAsText(file);
            }
        });
    }
}

export function buscarProdutoPorCodigo(barcode) {
    if (!barcode || barcode.trim() === '') return;
    const barcodeLimpo = String(barcode).trim();
    const produtoEncontrado = localCatalogo.find(p => p.barcode === barcodeLimpo);
    const productNameInput = document.getElementById('product-name');
    const productExpiryInput = document.getElementById('product-expiry');
    
    if (produtoEncontrado) {
        if (productNameInput) {
            productNameInput.value = produtoEncontrado.name;
            if (productExpiryInput) productExpiryInput.focus();
        }
    } else {
        if (productNameInput) productNameInput.value = '';
    }
}

export function renderTable() {
    const tableBody = document.getElementById('product-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    localProducts.forEach((product) => {
        const barcodeText = product.barcode ? product.barcode : '---';
        const qtyText = product.quantity ? product.quantity : '1';
        const sectorText = product.sector ? product.sector : 'Geral';
        const [ano, mes, dia] = product.expiry.split('-');
        const dataFormatada = (ano && mes && dia) ? `${dia}/${mes}/${ano}` : product.expiry;

        const isDark = document.body.classList.contains('dark-theme');
        const badgeBg = isDark ? '#334155' : '#e2e8f0';
        const badgeColor = isDark ? '#ffffff' : '#1e293b';
        const qtyColor = isDark ? '#ffffff' : '#1e293b';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="Cód. Barras"><span style="font-family: monospace; color: #64748b;">${barcodeText}</span></td>
            <td data-label="Produto"><strong>${product.name}</strong></td>
            <td data-label="Setor"><span class="badge-sector" style="background: ${badgeBg}; color: ${badgeColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">${sectorText}</span></td>
            <td data-label="Qtd"><span style="font-weight: 600; color: ${qtyColor};">${qtyText}</span></td>
            <td data-label="Vencimento">${dataFormatada}</td>
            <td data-label="Ação" style="text-align: center;"><button class="btn-del btn-del-prod" data-id="${product.id}">Remover</button></td>
        `;
        tableBody.appendChild(tr);
    });

    document.querySelectorAll('.btn-del-prod').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm("Deseja remover este produto definitivamente?")) {
                try { await deleteDoc(doc(db, "produtos", id)); } catch (err) { alert("Erro ao deletar: " + err.message); }
            }
        });
    });
}

export function renderAVencerTable() {
    const avencerTableBody = document.getElementById('avencer-table-body');
    if (!avencerTableBody) return;
    avencerTableBody.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentSectorFilter = getCurrentSectorFilter();

    localProducts.forEach((product) => {
        const expDate = new Date(product.expiry + 'T00:00:00');
        if (expDate >= today) {
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 10) {
                if (currentSectorFilter !== 'todos' && product.sector !== currentSectorFilter) return;
                
                const barcodeText = product.barcode ? product.barcode : '---';
                const qtyText = product.quantity ? product.quantity : '1';
                const sectorText = product.sector ? product.sector : 'Geral';
                const [ano, mes, dia] = product.expiry.split('-');
                const dataFormatada = `${dia}/${mes}/${ano}`;

                const isDark = document.body.classList.contains('dark-theme');
                const badgeBg = isDark ? '#334155' : '#e2e8f0';
                const badgeColor = isDark ? '#ffffff' : '#1e293b';
                const qtyColor = isDark ? '#ffffff' : '#1e293b';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td data-label="Cód. Barras"><span style="font-family: monospace; color: #64748b;">${barcodeText}</span></td>
                    <td data-label="Produto"><strong>${product.name}</strong></td>
                    <td data-label="Setor"><span class="badge-sector" style="background: ${badgeBg}; color: ${badgeColor}; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${sectorText}</span></td>
                    <td data-label="Qtd"><span style="font-weight: 600; color: ${qtyColor};">${qtyText}</span></td>
                    <td data-label="Vencimento">${dataFormatada}</td>
                    <td data-label="Faltam"><span class="badge vencido" style="background-color: #fff7ed; color: #c2410c; border: 1px solid #ffedd5;">${diffDays} dias</span></td>
                `;
                avencerTableBody.appendChild(tr);
            }
        }
    });
}