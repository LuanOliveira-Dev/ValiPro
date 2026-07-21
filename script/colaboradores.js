// js/colaboradores.js
import { db } from "./firebase.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const colaboradoresCollection = collection(db, "colaboradores");

// Escuta a lista de colaboradores em tempo real
export function escutarColaboradores(callback) {
    return onSnapshot(colaboradoresCollection, (snapshot) => {
        const colaboradores = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(colaboradores);
    });
}

// Adiciona um novo colaborador
export async function adicionarColaborador(nome) {
    if (!nome.trim()) return;
    return await addDoc(colaboradoresCollection, { nome: nome.trim() });
}

// Exclui um colaborador pelo ID
export async function removerColaborador(id) {
    return await deleteDoc(doc(db, "colaboradores", id));
}

// Preenche um <select> com os colaboradores cadastrados
export function preencherSelectColaboradores(selectElement, colaboradores, opcaoPadrao = "Selecione o Responsável") {
    if (!selectElement) return;

    selectElement.innerHTML = `<option value="">${opcaoPadrao}</option>`;
    colaboradores.forEach(colaborador => {
        const option = document.createElement('option');
        option.value = colaborador.nome;
        option.textContent = colaborador.nome;
        selectElement.appendChild(option);
    });
}