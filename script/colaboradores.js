import { colaboradoresCollection, db } from "./firebase.js";
import { addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export function initColaboradores() {
    const countColaboradores = document.getElementById('count-colaboradores');
    const colaboradorTableBody = document.getElementById('colaborador-table-body');
    const directColaboradorForm = document.getElementById('direct-colaborador-form');
    const directColaboradorNameInput = document.getElementById('direct-colaborador-name');

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

    if (directColaboradorForm) {
        directColaboradorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const colaboradorName = directColaboradorNameInput.value.trim();
            if (colaboradorName) {
                try {
                    await addDoc(colaboradoresCollection, { nome: colaboradorName, createdAt: new Date() });
                    directColaboradorForm.reset();
                } catch (err) { alert("Erro ao salvar o colaborador: " + err.message); }
            }
        });
    }
}