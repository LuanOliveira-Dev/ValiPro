// script/auth.js
import { auth } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/**
 * Monitora o estado de autenticação do usuário em páginas protegidas (ex: painel.html).
 * Se o usuário não estiver autenticado, redireciona para a página de login.
 */
export function monitorarSessao() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Se não estiver logado, redireciona para a tela de login
            window.location.replace("./index.html");
        } else {
            console.log("Sessão ativa para o usuário:", user.email);
        }
    });
}

/**
 * Realiza o encerramento da sessão (logout) do usuário no Firebase.
 */
export async function realizarLogout() {
    try {
        await signOut(auth);
        window.location.replace("./index.html");
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        alert("Erro ao encerrar a sessão. Tente novamente.");
    }
}
