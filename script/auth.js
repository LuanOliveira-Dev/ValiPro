// js/auth.js
import { auth } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Proteção de rota (Guarda de Navegação)
export function monitorarSessao() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            redirecionarParaLogin();
        }
    });
}

// Encerramento de sessão
export async function realizarLogout() {
    try {
        await signOut(auth);
        redirecionarParaLogin();
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        alert("Erro ao encerrar a sessão.");
    }
}

// Função auxiliar de redirecionamento
function redirecionarParaLogin() {
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    window.location.replace(window.location.origin + basePath + "index.html");
}