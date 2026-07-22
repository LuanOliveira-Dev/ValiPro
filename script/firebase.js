// script/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  // Verifique se a chave abaixo não tem nenhum caractere faltando
  apiKey: "AIzaSyBH4hDVSqv7enMugPWUaM9Cks04F1yKvuQ", 
  authDomain: "controle-de-validade-3e66a.firebaseapp.com",
  projectId: "controle-de-validade-3e66a",
  storageBucket: "controle-de-validade-3e66a.firebasestorage.app",
  messagingSenderId: "163605465156",
  appId: "1:163605465156:web:8f7728cbf73e6bf6265411"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
