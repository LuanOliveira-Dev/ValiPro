import { setoresCollection, db } from "./firebase.js";
import { addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getCurrentSectorFilter } from "./filtros.js";

export function initSetores() {
    const countSetores = document.getElementById('count-setores');
    const productSectorInput = document.getElementById('product-sector');
    const filterSectorAvencer = document.getElementById('filter-sector-avencer');
    const sectorTableBody = document.getElementById('sector-table-body');

    const btnAddSectorModal = document.getElementById('btn-add-sector-modal');
    const btnCloseSectorModal = document.getElementById('btn-close-sector-modal');
    const modalSector = document.getElementById('modal-sector');
    const sectorForm = document.getElementById('sector-form');
    const newSectorNameInput = document.getElementById('new-sector-name');
    const directSectorForm = document.getElementById('direct-sector-form');
    const directSectorNameInput = document.getElementById('direct-sector-name');

    // Escuta em tempo real os Setores
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
            const current = getCurrentSectorFilter();
            filterSectorAvencer.innerHTML = '<option value="todos">Todos os Setores</option>';
            listaSetores.forEach((setor) => {
                const option = document.createElement('option');
                option.value = setor.nome;
                option.textContent = setor.nome;
                if (setor.nome === current) option.selected = true;
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
                    if (confirm("Deseja remover este setor definitivamente?")) {
                        try { await deleteDoc(doc(db, "setores", id)); } catch (err) { alert("Erro ao deletar setor: " + err.message); }
                    }
                });
            });
        }
    });

    // Eventos do Modal de Setor
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
                } catch (err) { alert("Erro ao salvar o setor: " + err.message); }
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
                } catch (err) { alert("Erro ao salvar o setor: " + err.message); }
            }
        });
    }
}