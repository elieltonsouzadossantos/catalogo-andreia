# ADR-0012: Campo "disponível" como soft-hide de peça, sem exclusão do cadastro

**Status:** Aceito
**Data:** 2026-08-27

## Contexto
Ao excluir uma peça pelo painel (Decap CMS via git-gateway), a ação remove o
arquivo JSON da peça do repositório — recuperável só pelo histórico do Git, não
por nenhuma tela do painel (não existe lixeira ou "desfazer" na interface). A
Andreia perguntou se havia uma forma de tirar uma peça da vitrine do site sem
perder o cadastro (fotos, cores, tamanhos, descrição já preenchidos), pensando em
casos como falta de estoque temporária ou pausa na venda de uma peça específica
— situação que se tornou mais relevante durante a edição em massa das 106 peças
do catálogo, boa parte delas ainda como rascunhos incompletos do Quick Add.

Três caminhos foram considerados:
1. **Não fazer nada** — orientar a excluir e recadastrar a peça se precisar dela
   de volta. Rejeitado por ser destrutivo: perde todos os dados já preenchidos
   por algo que pode ser só uma pausa temporária.
2. **Uma coleção separada para peças arquivadas**, movendo o arquivo entre
   pastas. Rejeitado por adicionar complexidade desnecessária ao Decap CMS (mover
   entre `folder collections` não é uma operação nativa da interface) sem
   nenhum ganho sobre a alternativa mais simples abaixo.
3. **Um campo booleano aditivo na própria peça**, seguindo o padrão já
   estabelecido por plataformas de e-commerce consolidadas — o status
   Ativo/Rascunho/Arquivado da Shopify, e a visibilidade de catálogo
   (público/privado/oculto) da WooCommerce, ambos preservando o cadastro
   completo do produto ao escondê-lo da loja. **Escolhido.**

## Decisão
Adicionado o campo `disponivel` (widget `boolean`, `default: true`) ao schema da
peça em `public/admin/config.yml`, logo após o campo "Nome". No `script.js`, o
filtro `p.disponivel !== false` foi aplicado dentro de `carregarDados()` — a
única função que lê o `produtos.json` e popula o array `products` usado por todo
o resto do site — em vez de replicar o filtro em cada função de renderização.
Isso significa que `renderGrid()` e `getFeaturedProducts()` (usada por
`renderFeaturedCarousel()`) já saem filtradas automaticamente, e qualquer função
futura que leia do array `products` herda o mesmo comportamento sem precisar de
nenhuma alteração própria.

O uso de `!== false` (em vez de checar `=== true`) foi deliberado: como o campo é
novo, as peças já cadastradas antes dele não têm essa chave no JSON — tratá-las
como disponíveis por padrão (ausência de campo = visível) foi essencial para que
a migração fosse não-destrutiva sobre o catálogo já existente.

**Ressalva identificada após a implementação, ainda sem correção no código:** o
valor de `default: true` do Decap CMS só é aplicado a peças **criadas depois** do
campo existir. Peças antigas, que não têm essa chave salva, abrem no painel com o
interruptor exibido como **desligado** na tela — mesmo a peça continuando visível
no site (porque o `script.js` trata ausência de campo como disponível). Isso cria
uma armadilha de uso real: se alguém publicar uma peça antiga sem antes ligar o
interruptor, o painel grava `disponivel: false` de fato, e a peça passa a sumir
do site — um efeito colateral não intencional de uma edição que não tinha
relação nenhuma com esconder a peça. Essa lacuna foi mitigada por orientação ao
operador (um guia em PDF entregue à Andreia/Elielton explicando o cuidado), não
por nenhuma trava no código.

## Consequências
- **Benefícios:** segue um padrão de mercado já validado (Shopify, WooCommerce);
  é reversível a qualquer momento, bastando ligar o campo de novo; não duplica
  lógica de filtro entre grade e carrossel de destaques, por estar centralizado
  no único ponto de carregamento dos dados.
- **Riscos/limitações:** a armadilha descrita acima (interruptor exibido como
  desligado em peças antigas, mesmo estando disponíveis) é uma falha de UX real
  do painel, hoje mitigada só por instrução ao operador — não há validação nem
  aviso no código que impeça a publicação acidental de uma peça como
  indisponível. O campo também é estritamente binário (visível/oculto); se
  surgir a necessidade de mais estados no futuro (ex.: "esgotado, mas visível
  como indisponível para compra"), o campo precisaria ser reestruturado — mesma
  limitação estrutural já registrada para o campo `com_modelo` no ADR-0009.
- **Impactos:** `carregarDados()` em `script.js` passou a ter esse filtro como
  dependência obrigatória da funcionalidade — qualquer refatoração futura dessa
  função precisa preservá-lo, ou o soft-hide deixa de funcionar silenciosamente.
  Um guia em PDF (`guia_peca_disponivel.pdf`) foi entregue como documentação
  operacional da ressalva acima, mas nada no sistema garante que ele seja lido
  ou seguido. Uma melhoria futura razoável (fora do escopo desta decisão) seria
  fazer o Decap gravar `disponivel: true` explicitamente na primeira edição de
  qualquer peça antiga, eliminando o estado ambíguo — a viabilidade disso não foi
  investigada.
