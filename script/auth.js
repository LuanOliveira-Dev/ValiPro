// script/auth.js
import { auth } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Monitora a sessão no painel.html
export function monitorarSessao() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Se realmente NÃO houver usuário logado, manda para o login
            window.location.replace("index.html");
        } else {
            console.log("Usuário autenticado com sucesso:", user.email);
        }
    });
}

// Encerramento de sessão
export async function realizarLogout() {
    try {
        await signOut(auth);
        window.location.replace("index.html");
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
    }
}

// Função auxiliar segura para navegação
function redirecionarPara(pagina) {
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    
    // Evita redirecionar se já estiver na página correta
    if (!window.location.pathname.endsWith(pagina)) {
        window.location.replace(window.location.origin + basePath + pagina);
    }
}
