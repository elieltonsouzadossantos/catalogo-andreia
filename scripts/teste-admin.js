const { initializeApp, cert } = require("firebase-admin/app");
const serviceAccount = require("../serviceAccountKey.json");

console.log("Service Account type:", serviceAccount.type);

const app = initializeApp({
  credential: cert(serviceAccount)
});

console.log("Firebase Admin inicializado com sucesso!", app.name);