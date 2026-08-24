// Roda automaticamente a cada publicação (ver netlify.toml).
// Junta todos os arquivos de public/data/produtos/pecas/*.json num único
// public/data/produtos/produtos.json, que é o arquivo que o site
// (public/js/script.js) busca para montar o catálogo.
//
// Não editar public/data/produtos/produtos.json diretamente — ele é
// gerado por este script. Para editar ou cadastrar uma peça, use o
// painel (/admin), ou edite o arquivo dela dentro de
// public/data/produtos/pecas/.

const fs = require("fs");
const path = require("path");

const PASTA_PECAS = path.join(__dirname, "..", "public", "data", "produtos", "pecas");
const DESTINO = path.join(__dirname, "..", "public", "data", "produtos", "produtos.json");

if (!fs.existsSync(PASTA_PECAS)) {
  console.error(`❌ Pasta não encontrada: ${PASTA_PECAS}`);
  process.exit(1);
}

const arquivos = fs
  .readdirSync(PASTA_PECAS)
  .filter((f) => f.endsWith(".json"))
  .sort();

const produtos = [];
const erros = [];

for (const arquivo of arquivos) {
  const caminho = path.join(PASTA_PECAS, arquivo);
  try {
    const conteudo = JSON.parse(fs.readFileSync(caminho, "utf-8"));
    produtos.push(conteudo);
  } catch (e) {
    erros.push(`${arquivo}: ${e.message}`);
  }
}

if (erros.length > 0) {
  console.error("❌ Falha ao ler os seguintes arquivos de peça:");
  erros.forEach((e) => console.error("  - " + e));
  process.exit(1);
}

if (produtos.length === 0) {
  console.error(
    "❌ Nenhuma peça encontrada em public/data/produtos/pecas/ — abortando para não publicar um catálogo vazio por engano."
  );
  process.exit(1);
}

fs.writeFileSync(DESTINO, JSON.stringify({ produtos }, null, 2) + "\n");

console.log(
  `✅ produtos.json gerado com ${produtos.length} peça(s), a partir de ${arquivos.length} arquivo(s) em public/data/produtos/pecas/`
);
