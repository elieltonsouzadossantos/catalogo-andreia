// Script de USO ÚNICO — divide o produtos.json atual (uma lista única com
// todas as peças) em um arquivo por peça, dentro de
// public/data/produtos/pecas/. Faz parte da migração da coleção
// "Produtos" no painel: de um único arquivo com campo tipo "lista" para
// uma pasta com um arquivo por peça (ver ADR sobre o motivo da mudança).
//
// Rodar uma vez só, a partir da raiz do repositório:
//   node scripts/dividir-produtos-em-arquivos.js

const fs = require("fs");
const path = require("path");

const ORIGEM = path.join(__dirname, "..", "public", "data", "produtos", "produtos.json");
const PASTA_DESTINO = path.join(__dirname, "..", "public", "data", "produtos", "pecas");

const dados = JSON.parse(fs.readFileSync(ORIGEM, "utf-8"));

if (!Array.isArray(dados.produtos)) {
  console.error('❌ Formato inesperado: esperava um objeto com a chave "produtos" contendo uma lista.');
  process.exit(1);
}

if (!fs.existsSync(PASTA_DESTINO)) {
  fs.mkdirSync(PASTA_DESTINO, { recursive: true });
}

const existentes = fs.readdirSync(PASTA_DESTINO).filter((f) => f.endsWith(".json"));
if (existentes.length > 0) {
  console.error(
    `❌ A pasta ${PASTA_DESTINO} já tem ${existentes.length} arquivo(s). Para evitar duplicar, apague a pasta antes de rodar de novo, ou confirme que a migração já foi feita.`
  );
  process.exit(1);
}

dados.produtos.forEach((peca, indice) => {
  const numero = String(indice + 1).padStart(3, "0");
  const nomeArquivo = `peca-${numero}.json`;
  const caminho = path.join(PASTA_DESTINO, nomeArquivo);
  fs.writeFileSync(caminho, JSON.stringify(peca, null, 2) + "\n");
});

console.log(
  `✅ ${dados.produtos.length} peças divididas em arquivos individuais dentro de public/data/produtos/pecas/`
);
