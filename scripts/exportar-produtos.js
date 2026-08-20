const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

// Carrega a chave privada
const serviceAccount = require("../serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const PASTA_JSON = "./public/data/produtos";
const PASTA_IMAGENS = "./public/images";

// Remove acentos e caracteres especiais, deixando um nome de arquivo seguro
function slugify(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")      // remove os acentos (ã -> a, ç -> c, etc.)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")           // qualquer coisa que não for letra/número vira hífen
    .replace(/^-+|-+$/g, "");              // remove hífen sobrando no início/fim
}

// Decodifica uma string base64 "data:image/jpeg;base64,...." e salva como arquivo
function salvarImagemBase64(base64String, caminhoDestino) {
  const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    console.warn(`⚠️  Formato de imagem inesperado, pulando: ${caminhoDestino}`);
    return false;
  }
  const buffer = Buffer.from(matches[2], "base64");
  fs.writeFileSync(caminhoDestino, buffer);
  return true;
}

async function exportProdutos() {
  // Garante que as pastas de destino existem
  fs.mkdirSync(PASTA_JSON, { recursive: true });
  fs.mkdirSync(PASTA_IMAGENS, { recursive: true });

  const snapshot = await db.collection("produtos").get();

  let imagensSalvas = 0;
  let imagensComErro = 0;

  const produtos = snapshot.docs.map(doc => {
    const data = doc.data();
    const nomeArquivo = slugify(data.name) + ".jpg";
    let caminhoImagem = null; // sem foto real = null, o front-end mostra o ícone de roupa

    if (data.img) {
      const sucesso = salvarImagemBase64(data.img, path.join(PASTA_IMAGENS, nomeArquivo));
      if (sucesso) {
        caminhoImagem = "/images/" + nomeArquivo;
        imagensSalvas++;
      } else {
        imagensComErro++;
      }
    }

    return {
      id: data.id,
      nome: data.name,
      preco: data.price,
      descricao: data.desc,
      categoria: data.cat,
      cores: data.colors || [],
      tamanhos: data.sizes || [],
      imagem: caminhoImagem,
      destaque: data.featured || false
    };
  });

  fs.writeFileSync(
    path.join(PASTA_JSON, "produtos.json"),
    JSON.stringify(produtos, null, 2)
  );

  console.log(`✅ Exportação concluída: ${produtos.length} produtos salvos em public/data/produtos/produtos.json`);
  console.log(`🖼️  Imagens salvas: ${imagensSalvas} em public/images/`);
  if (imagensComErro > 0) {
    console.log(`⚠️  ${imagensComErro} produto(s) com problema na imagem — confira os avisos acima.`);
  }
}

exportProdutos().catch(err => {
  console.error("❌ Erro ao exportar produtos:", err);
  process.exit(1);
});
