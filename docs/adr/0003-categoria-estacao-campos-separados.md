# ADR-0003: Categoria e estação como campos separados (filtro facetado)

**Status:** Aceito
**Data:** 2026-08-06

## Contexto
A cliente pediu a adição de "Pijama de Verão" e "Pijama de Inverno" como novas seções
do catálogo. A abordagem mais simples seria criar essas duas strings como valores
adicionais do campo único `cat` (categoria), no mesmo nível de "Sutiã", "Calcinha" etc.
Essa abordagem, porém, mistura duas dimensões diferentes de um produto (tipo de peça
e estação de uso) em um único campo, o que dificulta consultas futuras (ex: "todos os
pijamas, independente da estação") e obriga a criar uma categoria nova para cada nova
combinação.

## Decisão
Modelar cada produto com dois campos independentes — `cat` (tipo de peça: Sutiã,
Calcinha, Conjunto, Pijama...) e `season` (atributo opcional: Verão, Inverno) — e
implementar um filtro de dois níveis na interface: filtro principal por categoria, com
um sub-filtro de estação exibido apenas quando a categoria "Pijama" está selecionada.
Esse é o padrão de "filtro facetado" usado por Mercado Livre, Amazon, Shopify e VTEX.

## Consequências
- **Benefícios:** permite adicionar novos atributos (cor, tecido, ocasião) no futuro
  sem reestruturar categorias existentes; permite consultas combinadas
  (categoria + estação) sem duplicar dados; escala bem conforme o catálogo cresce
  (relevante para a visão de longo prazo da ELIDAVY TECH de atender múltiplos clientes
  com catálogos maiores).
- **Riscos/limitações:** para um catálogo pequeno como o atual (poucos produtos), a
  diferença prática em relação à abordagem simples é mínima — o ganho real só aparece
  em escala; exige um pouco mais de código na camada de filtro (dois componentes de UI
  em vez de um).
- **Impactos:** ao migrar para Firestore (ver ADR-0001), o schema de produto deve
  preservar `cat` e `season` como campos distintos, e o painel admin deve oferecer
  ambos como campos de formulário separados, não como uma lista única de categorias.

## Adendo (2026-08-07): categorias derivadas automaticamente dos produtos
Complementando a decisão original: a lista de categorias exibida nos filtros
(`categories`) não é escrita manualmente — é derivada em tempo real a partir dos
produtos cadastrados:

```js
const categories = ["Todos", ...new Set(products.map(p=>p.cat))];
```

Isso segue o princípio de **Single Source of Truth** (fonte única de verdade): os
produtos são a única fonte real de dado, e o filtro é só um reflexo automático dela,
nunca uma lista mantida à parte. Na prática, isso significa que adicionar uma
categoria nova (ex: "Cueca") exige uma única edição — cadastrar o produto com o
campo `cat` correspondente — e o filtro correspondente aparece sozinho na interface,
sem risco de esquecer de atualizá-lo em um segundo lugar. Da mesma forma, uma
categoria sem nenhum produto cadastrado desaparece sozinha do filtro, evitando
filtros "fantasma" apontando para grades vazias.

Esse mesmo princípio deve ser considerado ao adicionar outros atributos derivados
no futuro (ex: lista de cores ou tamanhos disponíveis), mantendo sempre os produtos
como a fonte única de verdade do sistema.

## Adendo (2026-08-31): campo `estacao` exposto no painel admin
A decisão original (2026-08-06) já previa o campo `season` e a lógica de sub-filtro
Verão/Inverno — e, de fato, essa lógica sempre existiu em `public/js/script.js`
(`FACETS`, `renderFacetFilter()`, `renderGrid()`), desde a implementação inicial do
filtro facetado. O que faltava era a outra ponta: o campo correspondente nunca havia
sido adicionado ao formulário do painel administrativo (`public/admin/config.yml`),
então a Andreia não tinha como preencher `season` em nenhum produto. Na prática, o
sub-filtro existia na interface mas era inatingível — sempre exibia a grade vazia,
pois nenhum produto tinha o dado.

Essa lacuna foi identificada em 31/08/2026 a partir de um teste real no catálogo
publicado (clicar nos filtros Verão/Inverno e observar que todas as peças
desapareciam), confirmando o que a documentação técnica já apontava. A correção
consistiu em duas alterações mínimas, sem mudar a decisão de design original:

1. **`public/admin/config.yml`** — adição do campo `estacao` (widget `select`,
   opções "Verão"/"Inverno", opcional, com texto de ajuda explicando que só se
   aplica à categoria Pijama).
2. **`public/js/script.js`** — no mapeamento de `carregarDados()`, adição de
   `season: p.estacao || undefined`, conectando o novo campo do painel ao nome
   interno (`season`) já esperado pela lógica de filtro existente.

Nenhum novo ADR foi necessário: trata-se da conclusão de uma decisão já aceita,
não de uma nova decisão de arquitetura. Este adendo documenta apenas que a
implementação foi fechada nessa data. Ver `docs/documentacao-tecnica.md` (seção
05, tabela de campos do painel) para o registro operacional do campo.
