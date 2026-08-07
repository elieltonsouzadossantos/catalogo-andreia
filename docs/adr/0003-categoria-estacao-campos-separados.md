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
