// js/setores.js
import { db } from "./firebase.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const setoresCollection = collection(db, "setores");

// Escuta em tempo real a coleção de setores
export function escutarSetores(callback) {
    return onSnapshot(setoresCollection, (snapshot) => {
        const setores = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(setores);
    });
}

// Adiciona um novo setor no Firestore
export async function adicionarSetor(nomeSetor) {
    if (!nomeSetor.trim()) return;
    return await addDoc(setoresCollection, { nome: nomeSetor.trim() });
}

// Exclui um setor pelo ID
export async function removerSetor(id) {
    return await deleteDoc(doc(db, "setores", id));
}

// Preenche elementos <select> com os setores cadastrados
export function preencherSelectSetores(selectElement, setores, opcaoPadrao = "Todos os Setores") {
    if (!selectElement) return;
    
    selectElement.innerHTML = `<option value="">${opcaoPadrao}</option>`;
    setores.forEach(setor => {
        const option = document.createElement('option');
        option.value = setor.nome;
        option.textContent = setor.nome;
        selectElement.appendChild(option);
    });
}