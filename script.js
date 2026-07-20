// 1. IMPORTA A CONEXÃO DIRETO DO SEU ARQUIVO CENTRALIZADO
import { auth, db } from "./firebase-config.js";

// 2. IMPORTA APENAS AS FUNÇÕES DE TABELA/DADOS QUE O PAINEL PRECISA DO FIRESTORE
import { collection, addDoc, onSnapshot, deleteDoc, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
const produtosCollection = collection(db, "produtos");
const catalogoCollection = collection(db, "catalogo");
const setoresCollection = collection(db, "setores");
const colaboradoresCollection = collection(db, "colaboradores");

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Elementos do Formulário e UI
    const productForm = document.getElementById('product-form');
    const productBarcodeInput = document.getElementById('product-barcode');
    const productNameInput = document.getElementById('product-name');
    const productQuantityInput = document.getElementById('product-quantity');
    const productExpiryInput = document.getElementById('product-expiry');
    const productSectorInput = document.getElementById('product-sector');

    // 2. Elementos das Abas e Contadores
    const viewDashboard = document.getElementById('view-dashboard');
    const viewAddProduct = document.getElementById('view-add-product');
    const viewColetados = document.getElementById('view-coletados');
    const viewDatabase = document.getElementById('view-database');
    const viewAVencer = document.getElementById('view-avencer');
    const viewSetor = document.getElementById('view-setor');
    const viewColaborador = document.getElementById('view-colaborador');
    const viewConfiguracao = document.getElementById('view-configuracao');

    const btnCardAdicionar = document.getElementById('btn-card-adicionar');
    const btnCardDatabase = document.getElementById('btn-card-database');
    const btnCardColetados = document.getElementById('btn-card-coletados');
    const btnCardAVencer = document.getElementById('btn-card-avencer');
    const btnCardSetor = document.getElementById('btn-card-setor');
    const btnCardColaborador = document.getElementById('btn-card-colaborador');
    const btnCardConfig = document.getElementById('btn-card-config');
    const btnToggleTheme = document.getElementById('btn-toggle-theme');

    const btnBack = document.getElementById('btn-back');
    const btnHome = document.getElementById('btn-home');
    const btnLogout = document.getElementById('btn-logout');

    const countAVencer = document.getElementById('count-avencer');
    const countVencidos = document.getElementById('count-vencidos');
    const countConferidos = document.getElementById('count-conferidos');
    const countColetados = document.getElementById('count-coletados');
    const countSetores = document.getElementById('count-setores');
    const countColaboradores = document.getElementById('count-colaboradores');

    const tableBody = document.getElementById('product-table-body');
    const avencerTableBody = document.getElementById('avencer-table-body');
    const sectorTableBody = document.getElementById('sector-table-body');
    const colaboradorTableBody = document.getElementById('colaborador-table-body');
    const dashboardSubtitle = document.getElementById('dashboard-subtitle');
    const dashboardMainTitle = document.getElementById('dashboard-main-title');

    const directSectorForm = document.getElementById('direct-sector-form');
    const directSectorNameInput = document.getElementById('direct-sector-name');

    const directColaboradorForm = document.getElementById('direct-colaborador-form');
    const directColaboradorNameInput = document.getElementById('direct-colaborador-name');

    const csvFileInput = document.getElementById('csv-file-input');
    const countCloud = document.getElementById('count-cloud');
    const panelCloudCounter = document.getElementById('panel-cloud-counter');

    const btnScan = document.getElementById('btn-scan');
    const btnStopScan = document.getElementById('btn-stop-scan');
    const scannerWrapper = document.getElementById('scanner-wrapper');
    let html5QrcodeScanner = null;

    const filterSectorAvencer = document.getElementById('filter-sector-avencer');

    const btnAddSectorModal = document.getElementById('btn-add-sector-modal');
    const btnCloseSectorModal = document.getElementById('btn-close-sector-modal');
    const modalSector = document.getElementById('modal-sector');
    const sectorForm = document.getElementById('sector-form');
    const newSectorNameInput = document.getElementById('new-sector-name');

    let localProducts = [];
    let localCatalogo = [];
    let currentSectorFilter = 'todos';

    // --- SISTEMA DE ALTERNÂNCIA DE ABAS ---
    function showAddProductTab() {
        hideAllTabs();
        if (viewAddProduct) viewAddProduct.classList.remove('hidden');
        if (btnBack) btnBack.classList.remove('hidden');
        if (dashboardMainTitle) dashboardMainTitle.textContent = "Adicionar Produto";
        if (dashboardSubtitle) dashboardSubtitle.textContent = "Adicionar Produto ao Estoque";
        if (productBarcodeInput) productBarcodeInput.focus();
    }

    function showDatabaseTab() {
        hideAllTabs();
        if (viewDatabase) viewDatabase.classList.remove('hidden');
        if (btnBack) btnBack.classList.remove('hidden');
        if (dashboardMainTitle) dashboardMainTitle.textContent = "Gerenciamento de Nuvem";
        if (dashboardSubtitle) dashboardSubtitle.textContent = "Gerenciamento de Nuvem e Integração";
    }

    function showConfiguracaoTab() {
        hideAllTabs();
        if (viewConfiguracao) viewConfiguracao.classList.remove('hidden');
        if (btnBack) btnBack.classList.remove('hidden');
        if (dashboardMainTitle) dashboardMainTitle.textContent = "Configurações";
        if (dashboardSubtitle) dashboardSubtitle.textContent = "Configurações do Painel";
    }

    function showColetadosTab() {
        hideAllTabs();
        if (viewColetados) viewColetados.classList.remove('hidden');
        if (btnBack) btnBack.classList.remove('hidden');
        if (dashboardMainTitle) dashboardMainTitle.textContent = "Produtos Coletados";
        if (dashboardSubtitle) dashboardSubtitle.textContent = "Produtos Coletados / Lista Geral";
    }

    function showAVencerTab() {
        hideAllTabs();
        if (viewAVencer) viewAVencer.classList.remove('hidden');
        if (btnBack) btnBack.classList.remove('hidden');
        if (dashboardMainTitle) dashboardMainTitle.textContent = "Produtos Críticos";
        if (dashboardSubtitle) dashboardSubtitle.textContent = "Produtos Críticos - Vencimento Próximo";
        renderAVencerTable();
    }

    function showSetorTab() {
        hideAllTabs();
        if (viewSetor) viewSetor.classList.remove('hidden');
        if (btnBack) btnBack.classList.remove('hidden');
        if (dashboardMainTitle) dashboardMainTitle.textContent = "Gerenciar Setores";
        if (dashboardSubtitle) dashboardSubtitle.textContent = "Gerenciar e Cadastrar Setores da Loja";
    }

    function showColaboradorTab() {
        hideAllTabs();
        if (viewColaborador) viewColaborador.classList.remove('hidden');
        if (btnBack) btnBack.classList.remove('hidden');
        if (dashboardMainTitle) dashboardMainTitle.textContent = "Gerenciar Colaboradores";
        if (dashboardSubtitle) dashboardSubtitle.textContent = "Gerenciar e Cadastrar Colaboradores da Loja";
    }

    function showDashboardTab() {
        stopScanner();
        hideAllTabs();
        if (viewDashboard) viewDashboard.classList.remove('hidden');
        if (btnBack) btnBack.classList.add('hidden');
        if (dashboardMainTitle) dashboardMainTitle.textContent = "Painel Geral";
        if (dashboardSubtitle) dashboardSubtitle.textContent = "Painel Geral de Monitoramento";
    }

    function hideAllTabs() {
        if (viewDashboard) viewDashboard.classList.add('hidden');
        if (viewAddProduct) viewAddProduct.classList.add('hidden');
        if (viewDatabase) viewDatabase.classList.add('hidden');
        if (viewColetados) viewColetados.classList.add('hidden');
        if (viewAVencer) viewAVencer.classList.add('hidden');
        if (viewSetor) viewSetor.classList.add('hidden');
        if (viewColaborador) viewColaborador.classList.add('hidden');
        if (viewConfiguracao) viewConfiguracao.classList.add('hidden');
    }

    if (btnCardAdicionar) btnCardAdicionar.addEventListener('click', showAddProductTab);
    if (btnCardDatabase) btnCardDatabase.addEventListener('click', showDatabaseTab);
    if (btnCardColetados) btnCardColetados.addEventListener('click', showColetadosTab);
    if (btnCardAVencer) btnCardAVencer.addEventListener('click', showAVencerTab);
    if (btnCardSetor) btnCardSetor.addEventListener('click', showSetorTab);
    if (btnCardColaborador) btnCardColaborador.addEventListener('click', showColaboradorTab);
    if (btnCardConfig) btnCardConfig.addEventListener('click', showConfiguracaoTab);
    if (btnBack) btnBack.addEventListener('click', showDashboardTab);
    if (btnHome) btnHome.addEventListener('click', showDashboardTab);

    // --- CONTROLE DO MODAL E CADASTROS DIRETOS ---
    if (btnAddSectorModal && modalSector) {
        btnAddSectorModal.addEventListener('click', () => {
            modalSector.classList.remove('hidden');
            modalSector.style.display = 'flex';
            newSectorNameInput.focus();
        });
    }

    if (btnCloseSectorModal && modalSector) {
        btnCloseSectorModal.addEventListener('click', () => {
            modalSector.classList.add('hidden');
            modalSector.style.display = 'none';
            sectorForm.reset();
        });
    }

    if (sectorForm) {
        sectorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const sectorName = newSectorNameInput.value.trim().toUpperCase();
            if (sectorName) {
                try {
                    await addDoc(setoresCollection, { nome: sectorName, createdAt: new Date() });
                    sectorForm.reset();
                    modalSector.classList.add('hidden');
                    modalSector.style.display = 'none';
                } catch (err) {
                    alert("Erro ao salvar o setor: " + err.message);
                }
            }
        });
    }

    if (directSectorForm) {
        directSectorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const sectorName = directSectorNameInput.value.trim().toUpperCase();
            if (sectorName) {
                try {
                    await addDoc(setoresCollection, { nome: sectorName, createdAt: new Date() });
                    directSectorForm.reset();
                } catch (err) {
                    alert("Erro ao salvar o setor: " + err.message);
                }
            }
        });
    }

    if (directColaboradorForm) {
        directColaboradorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const colaboradorName = directColaboradorNameInput.value.trim();
            if (colaboradorName) {
                try {
                    await addDoc(colaboradoresCollection, { nome: colaboradorName, createdAt: new Date() });
                    directColaboradorForm.reset();
                } catch (err) {
                    alert("Erro ao salvar o colaborador: " + err.message);
                }
            }
        });
    }

    // --- ESCREVER SINCRONIZAÇÃO EM TEMPO REAL (SNAPSHOTS) ---
    onSnapshot(setoresCollection, (snapshot) => {
        let listaSetores = [];
        snapshot.forEach((doc) => { listaSetores.push({ id: doc.id, ...doc.data() }); });
        listaSetores.sort((a, b) => a.nome.localeCompare(b.nome));

        if (countSetores) countSetores.textContent = listaSetores.length;

        if (productSectorInput) {
            productSectorInput.innerHTML = '<option value="">Selecione um Setor</option>';
            listaSetores.forEach((setor) => {
                const option = document.createElement('option');
                option.value = setor.nome;
                option.textContent = setor.nome;
                productSectorInput.appendChild(option);
            });
        }

        if (filterSectorAvencer) {
            filterSectorAvencer.innerHTML = '<option value="todos">Todos os Setores</option>';
            listaSetores.forEach((setor) => {
                const option = document.createElement('option');
                option.value = setor.nome;
                option.textContent = setor.nome;
                if (setor.nome === currentSectorFilter) option.selected = true;
                filterSectorAvencer.appendChild(option);
            });
        }

        if (sectorTableBody) {
            sectorTableBody.innerHTML = '';
            listaSetores.forEach((setor) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${setor.nome}</strong></td>
                    <td style="text-align: center;">
                        <button class="btn-del btn-del-sector" data-id="${setor.id}">Remover</button>
                    </td>
                `;
                sectorTableBody.appendChild(tr);
            });

            document.querySelectorAll('.btn-del-sector').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (confirm("Deseja remover este setor definitivamente? Isso não apagará os produtos vinculados a ele.")) {
                        try { await deleteDoc(doc(db, "setores", id)); } catch (err) { alert("Erro ao deletar setor: " + err.message); }
                    }
                });
            });
        }
    });

    onSnapshot(colaboradoresCollection, (snapshot) => {
        let listaColaboradores = [];
        snapshot.forEach((doc) => { listaColaboradores.push({ id: doc.id, ...doc.data() }); });
        listaColaboradores.sort((a, b) => a.nome.localeCompare(b.nome));

        if (countColaboradores) countColaboradores.textContent = listaColaboradores.length;

        if (colaboradorTableBody) {
            colaboradorTableBody.innerHTML = '';
            listaColaboradores.forEach((colaborador) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${colaborador.nome}</strong></td>
                    <td style="text-align: center;">
                        <button class="btn-del btn-del-colaborador" data-id="${colaborador.id}">Remover</button>
                    </td>
                `;
                colaboradorTableBody.appendChild(tr);
            });

            document.querySelectorAll('.btn-del-colaborador').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (confirm("Deseja remover este colaborador definitivamente?")) {
                        try { await deleteDoc(doc(db, "colaboradores", id)); } catch (err) { alert("Erro ao deletar colaborador: " + err.message); }
                    }
                });
            });
        }
    });

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
        updateCounters();
    }, (error) => {
        console.error("Erro ao sincronizar produtos:", error);
    });

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
    }, (error) => {
        console.error("Erro ao sincronizar catálogo:", error);
    });

    function buscarProdutoPorCodigo(barcode) {
        if (!barcode || barcode.trim() === '') return;
        const barcodeLimpo = String(barcode).trim();
        const produtoEncontrado = localCatalogo.find(p => p.barcode === barcodeLimpo);
        
        if (produtoEncontrado) {
            if (productNameInput) {
                productNameInput.value = produtoEncontrado.name;
                if (productExpiryInput) productExpiryInput.focus();
            }
        } else {
            if (productNameInput) productNameInput.value = '';
        }
    }

    if (productBarcodeInput) {
        productBarcodeInput.addEventListener('blur', () => { buscarProdutoPorCodigo(productBarcodeInput.value); });
        productBarcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarProdutoPorCodigo(productBarcodeInput.value);
            }
        });
    }

    // --- IMPORTAÇÃO DE BANCO DE DADOS (CSV) ---
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
                        alert(`Sucesso! ${totalImportados} produtos salvos permanentemente na nuvem.`);
                        csvFileInput.value = "";
                    } else {
                        alert("Não foi possível ler os produtos. Verifique se o CSV tem código na primeira coluna e nome na segunda.");
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    // --- ESCANEAR CÓDIGO COM CÂMERA (HTML5-QRCODE) ---
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
                (errorMessage) => {}
            ).catch(err => {
                alert("Erro ao acessar a câmera: " + err);
                stopScanner();
            });
        });
    }

    if (btnStopScan) btnStopScan.addEventListener('click', stopScanner);

    function stopScanner() {
        if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
            html5QrcodeScanner.stop().then(() => {
                scannerWrapper.classList.add('hidden');
            }).catch(err => console.log(err));
        } else {
            scannerWrapper.classList.add('hidden');
        }
    }

    // --- CÁLCULO DE CONTADORES E DATAS ---
    function updateCounters() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let vencidos = 0;
        let aVencer = 0;

        localProducts.forEach(p => {
            const expDate = new Date(p.expiry + 'T00:00:00');
            
            if (expDate < today) {
                vencidos++;
            } else {
                const diffTime = expDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 10) aVencer++;
            }
        });

        const total = localProducts.length;
        if (countAVencer) countAVencer.textContent = aVencer;
        if (countVencidos) countVencidos.textContent = vencidos;
        if (countConferidos) countConferidos.textContent = total;
        if (countColetados) countColetados.textContent = total;
    }

    // --- PROCESSAMENTO E EXIBIÇÃO DE TABELAS ---
    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        localProducts.forEach((product) => {
            const expDate = new Date(product.expiry + 'T00:00:00');
            const barcodeText = product.barcode ? product.barcode : '---';
            const qtyText = product.quantity ? product.quantity : '1';
            const sectorText = product.sector ? product.sector : 'Geral';

            const [ano, mes, dia] = product.expiry.split('-');
            const dataFormatada = (ano && mes && dia) ? `${dia}/${mes}/${ano}` : expDate.toLocaleDateString('pt-BR');

            // SISTEMA INTELIGENTE DE CORES ADAPTATIVAS (EVITA TEXTO APAGADO NO ESCURO)
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
                <td data-label="Ação" style="text-align: center;"><button class="btn-del" data-id="${product.id}">Remover</button></td>
            `;
            tableBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-del:not(.btn-del-sector):not(.btn-del-colaborador)').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm("Deseja remover este produto definitivamente?")) {
                    try { await deleteDoc(doc(db, "produtos", id)); } catch (err) { alert("Erro ao deletar documento: " + err.message); }
                }
            });
        });
    }

    function renderAVencerTable() {
        if (!avencerTableBody) return;
        avencerTableBody.innerHTML = '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

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

                    // SISTEMA INTELIGENTE DE CORES ADAPTATIVAS (EVITA TEXTO APAGADO NO ESCURO)
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

    if (filterSectorAvencer) {
        filterSectorAvencer.addEventListener('change', (e) => {
            currentSectorFilter = e.target.value;
            renderAVencerTable();
        });
    }

    // --- FORMULÁRIO DE CADASTRO DE PRODUTO ---
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
                        sector
                    });
                    
                    productBarcodeInput.value = '';
                    productNameInput.value = '';
                    productExpiryInput.value = '';
                    if (productQuantityInput) productQuantityInput.value = "";
                    if (productBarcodeInput) productBarcodeInput.focus();
                } catch (err) {
                    alert("Erro ao salvar no Firestore: " + err.message);
                }
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            window.location.replace(window.location.origin + basePath + "index.html");
        });
    }

    // --- CONTROLE DE MODO ESCURO ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    if (btnToggleTheme) {
        btnToggleTheme.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
            // Força as tabelas a redesenharem com as cores certas na mesma hora do clique
            renderTable();
            renderAVencerTable();
        });
    }
});
