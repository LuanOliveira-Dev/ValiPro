// js/produtos.js
import { db } from "./firebase.js";
import { collection, addDoc, onSnapshot, deleteDoc, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const produtosCollection = collection(db, "produtos");
const catalogoCollection = collection(db, "catalogo");

// Escuta as alterações na lista de produtos do estoque em tempo real
export function escutarProdutos(callback) {
    return onSnapshot(produtosCollection, (snapshot) => {
        const produtos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(produtos);
    });
}

// Escuta a lista de catálogo (produtos pré-cadastrados para busca automática)
export function escutarCatalogo(callback) {
    return onSnapshot(catalogoCollection, (snapshot) => {
        const catalogo = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(catalogo);
    });
}

// Cadastra um novo produto com validade
export async function salvarProduto(dadosProduto) {
    return await addDoc(produtosCollection, dadosProduto);
}

// Exclui um único produto pelo ID
export async function excluirProduto(id) {
    return await deleteDoc(doc(db, "produtos", id));
}

// Exclui múltiplos produtos em lote (Batch Delete)
export async function excluirProdutosEmLote(idsArray) {
    if (!idsArray || idsArray.length === 0) return;
    
    const batch = writeBatch(db);
    idsArray.forEach(id => {
        const docRef = doc(db, "produtos", id);
        batch.delete(docRef);
    });
    
    return await batch.commit();
}