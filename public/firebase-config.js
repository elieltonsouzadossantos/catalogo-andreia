// firebase-config.js
// Configuração de conexão com o projeto Firebase (Andreia Pateis).
// Esses valores são públicos por natureza — a segurança real do banco de dados
// vem das regras do Firestore (ver docs/adr para o raciocínio completo), não do
// sigilo dessas chaves.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQk_Fu63ZvxbJ67KUbUu9o2B29Ef2CFII",
  authDomain: "andreia-pateis.firebaseapp.com",
  projectId: "andreia-pateis",
  storageBucket: "andreia-pateis.firebasestorage.app",
  messagingSenderId: "189443575103",
  appId: "1:189443575103:web:25220834adc15ba247578a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
