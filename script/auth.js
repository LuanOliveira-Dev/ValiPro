import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Insira aqui as configurações do seu projeto Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_ID",
    appId: "SEU_APP_ID"
};

export function initAuth() {
    let app, auth;
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
    } catch (e) {
        console.warn("Firebase não configurado ou rodando em modo local/demonstração.");
    }

    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const eyeIcon = document.getElementById('eye-icon');
    const alertBox = document.getElementById('alert-box');
    const btnSubmit = document.getElementById('btn-submit');
    const btnText = btnSubmit ? btnSubmit.querySelector('.btn-text') : null;
    const btnArrow = btnSubmit ? btnSubmit.querySelector('.btn-arrow') : null;
    const btnLoader = btnSubmit ? btnSubmit.querySelector('.btn-loader') : null;

    // Toggle de Visibilidade da Senha
    if (togglePasswordBtn && passwordInput && eyeIcon) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            
            // Troca o ícone do olho
            eyeIcon.innerHTML = isPassword 
                ? `<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>`
                : `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`;
        });
    }

    // Submissão do Formulário
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                showAlert('Por favor, preencha todos os campos.', 'error');
                return;
            }

            setLoading(true);
            hideAlert();

            try {
                if (auth) {
                    await signInWithEmailAndPassword(auth, email, password);
                    showAlert('Login realizado com sucesso! Redirecionando...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1200);
                } else {
                    // Modo Fallback/Simulação caso o Firebase não tenha as chaves configuradas
                    setTimeout(() => {
                        showAlert('Login realizado com sucesso! (Modo Simulação)', 'success');
                        setLoading(false);
                    }, 1000);
                }
            } catch (error) {
                setLoading(false);
                let message = 'Ocorreu um erro ao fazer login.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    message = 'E-mail ou senha incorretos.';
                } else if (error.code === 'auth/invalid-email') {
                    message = 'Endereço de e-mail inválido.';
                }
                showAlert(message, 'error');
            }
        });
    }

    function showAlert(msg, type) {
        if (!alertBox) return;
        alertBox.textContent = msg;
        alertBox.className = `alert ${type}`;
    }

    function hideAlert() {
        if (!alertBox) return;
        alertBox.className = 'alert hidden';
    }

    function setLoading(isLoading) {
        if (!btnSubmit) return;
        btnSubmit.disabled = isLoading;
        if (isLoading) {
            if (btnText) btnText.classList.add('hidden');
            if (btnArrow) btnArrow.classList.add('hidden');
            if (btnLoader) btnLoader.classList.remove('hidden');
        } else {
            if (btnText) btnText.classList.remove('hidden');
            if (btnArrow) btnArrow.classList.remove('hidden');
            if (btnLoader) btnLoader.classList.add('hidden');
        }
    }
}
