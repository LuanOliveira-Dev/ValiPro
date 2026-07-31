import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { showAlert } from "./utils.js";

// Inicializa os ouvintes de autenticação da tela de Login (se existir na página)
export function initAuth() {
  const loginForm = document.getElementById('login-form');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const eyeIcon = document.getElementById('eye-icon');

  if (togglePasswordBtn && passwordInput && eyeIcon) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      
      // Alterna o ícone entre Olho Aberto e Fechado
      if (isPassword) {
        eyeIcon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
      } else {
        eyeIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
      }
    });
  }

  // Mantém a submissão do Firebase existente...
}

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                showAlert('Por favor, preencha todos os campos.');
                return;
            }

            const btnText = btnSubmit.querySelector('.btn-text');
            const btnLoader = btnSubmit.querySelector('.btn-loader');
            
            btnSubmit.disabled = true;
            if (btnText) btnText.classList.add('hidden');
            if (btnLoader) btnLoader.classList.remove('hidden');

            try {
                await signInWithEmailAndPassword(auth, email, password);
                showAlert('Acesso autorizado! Redirecionando...', 'success');
                setTimeout(() => {
                    const currentPath = window.location.pathname;
                    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
                    window.location.replace(window.location.origin + basePath + "painel.html");
                }, 800);
            } catch (error) {
                showAlert(getFriendlyErrorMessage(error.code), 'error');
                btnSubmit.disabled = false;
                if (btnText) btnText.classList.remove('hidden');
                if (btnLoader) btnLoader.classList.add('hidden');
            }
        });
    }
}

// Verifica a proteção de rotas no painel
export function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (!user && window.location.pathname.includes('painel.html')) {
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            window.location.replace(window.location.origin + basePath + "index.html");
        }
    });
}

// Configura o botão de Logout
export function setupLogout() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                await signOut(auth);
                const currentPath = window.location.pathname;
                const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
                window.location.replace(window.location.origin + basePath + "index.html");
            } catch (error) {
                alert("Erro ao encerrar a sessão.");
            }
        });
    }
}

function getFriendlyErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email': return 'E-mail inválido ou mal formatado.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': return 'E-mail ou senha incorretos.';
        case 'auth/too-many-requests': return 'Muitas tentativas. Tente mais tarde.';
        default: return 'Falha ao realizar login.';
    }
}
