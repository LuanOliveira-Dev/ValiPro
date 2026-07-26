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
                sector: data.sector || '',
                favorito: data.favorito || false
            });
        });
        renderTable();
        renderAVencerTable();
        updateCounters(localProducts);
    });

    // Escuta em tempo real o catálogo na nuvem
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

    // Auto-preenchimento por código de barras
    if (productBarcodeInput) {
        productBarcodeInput.addEventListener('blur', () => buscarProdutoPorCodigo(productBarcodeInput.value));
        productBarcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarProdutoPorCodigo(productBarcodeInput.value);
            }
        });
    }

    // Adicionar novo produto
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
                    await addDoc(produtosCollection, { 
                        barcode, 
                        name, 
                        quantity, 
                        expiry, 
                        sector,
                        createdAt: new Date()
                    });
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

// Renderiza a lista de produtos com o NOVO DESIGN de Card
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

        const card = document.createElement('div');
        card.className = 'product-card-v2';
        card.innerHTML = `
            <div class="card-v2-header">
                <div class="card-v2-title-group">
                    <h3 class="card-v2-title">${product.name}</h3>
                    <span class="card-v2-barcode">Cód. barras: ${barcodeText}</span>
                </div>
                <button class="btn-favorite ${product.favorito ? 'active' : ''}" data-id="${product.id}" title="Favoritar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="${product.favorito ? '#f59e0b' : 'none'}" stroke="#f59e0b" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </button>
            </div>

            <div class="card-v2-divider"></div>

            <div class="card-v2-body">
                <div class="card-v2-info-item">
                    <div class="info-icon icon-blue">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    </div>
                    <div class="info-text">
                        <span class="info-label">Setor</span>
                        <strong class="info-value">${sectorText}</strong>
                    </div>
                </div>

                <div class="card-v2-info-item">
                    <div class="info-icon icon-green">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div class="info-text">
                        <span class="info-label">Vencimento</span>
                        <strong class="info-value">${dataFormatada}</strong>
                    </div>
                </div>

                <div class="card-v2-info-item">
                    <div class="info-icon icon-purple">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                    <div class="info-text">
                        <span class="info-label">Qtd.</span>
                        <strong class="info-value">${qtyText}</strong>
                    </div>
                </div>

                <div class="card-v2-action">
                    <button class="btn-del-v2 btn-del-prod" data-id="${product.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Remover
                    </button>
                </div>
            </div>
        `;
        tableBody.appendChild(card);
    });

    // Eventos de Deletar
    document.querySelectorAll('.btn-del-prod').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm("Deseja remover este produto definitivamente?")) {
                try { 
                    await deleteDoc(doc(db, "produtos", id)); 
                } catch (err) { 
                    alert("Erro ao deletar: " + err.message); 
                }
            }
        });
    });
}

// Renderiza a aba de Produtos a Vencer
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
