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
