// script/auth.js
import { auth } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Monitora a sessão especificamente para páginas PROTEGIDAS (como o painel.html)
export function monitorarSessao() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Se NÃO estiver logado e tentar acessar o painel, vai para a tela de login
            redirecionarPara("index.html");
        }
    });
}

// Encerramento de sessão
export async function realizarLogout() {
    try {
        await signOut(auth);
        redirecionarPara("index.html");
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        alert("Erro ao encerrar a sessão.");
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
