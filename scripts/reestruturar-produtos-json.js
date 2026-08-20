// Script de USO ÚNICO — roda uma vez só, para adaptar o produtos.json
// já existente ao formato que o Decap CMS espera (objeto com a chave
// "produtos", em vez de um array solto no topo do arquivo).
const fs = require("fs");

const CAMINHO = "./public/data/produtos/produtos.json";

const dadosAtuais = JSON.parse(fs.readFileSync(CAMINHO, "utf-8"));

// Se já foi migrado antes (tem a chave "produtos"), não faz nada de novo.
if (!Array.isArray(dadosAtuais)) {
  console.log("⚠️  Este arquivo já parece estar no formato novo. Nada foi alterado.");
  process.exit(0);
}

// Remove o campo "id" de cada produto — não é mais necessário,
// o script.js do site passa a gerar o id pela posição na lista.
const produtos = dadosAtuais.map(({ id, ...resto }) => resto);

const novoConteudo = { produtos };

fs.writeFileSync(CAMINHO, JSON.stringify(novoConteudo, null, 2));

console.log(`✅ produtos.json reestruturado: ${produtos.length} produtos, agora no formato { "produtos": [...] }`);
