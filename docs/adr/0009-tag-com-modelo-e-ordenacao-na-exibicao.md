# ADR-0009: Classificação "com modelo / sem modelo" como campo de dados, não como ordem no arquivo

**Status:** Aceito
**Data:** 2026-08-23

## Contexto
Durante uma importação em massa de 122 fotos (51 da pasta "comprimidas" + 27 de um lote
separado de fotos com modelo vestindo a peça), cada foto virou um produto rascunho no
`produtos.json`, na ordem em que os arquivos foram processados. O resultado, visível no
catálogo publicado, foi peças com modelo e peças sem modelo aparecendo misturadas na
grade — porque o site sempre exibe os produtos na mesma ordem em que aparecem no array
do JSON.

Uma primeira correção foi feita reescrevendo manualmente o array do `produtos.json`,
reagrupando as 78 peças novas em dois blocos contíguos (sem modelo primeiro, com modelo
depois). Essa correção resolveu o problema no momento, mas expôs uma limitação
estrutural: o painel administrativo (Decap CMS) sempre adiciona produtos novos, cadastrados
pela Andreia através do botão "Add", **no final do array** — sem opção de inserir em outra
posição. Ou seja, se a Andreia continuar cadastrando peças alternando entre com e sem
modelo ao longo do tempo, a mistura volta a acontecer aos poucos, e a única forma de
corrigir seria repetir manualmente esse reagrupamento do array a cada vez.

Duas alternativas mais simples foram consideradas e descartadas: (1) reordenar o array
sob demanda sempre que a mistura incomodasse, o que não resolve nada de fato — só
adia o problema e depende de alguém lembrar de pedir; e (2) orientar a Andreia a sempre
cadastrar peças em lotes por tipo (todas sem modelo de uma vez, depois todas com modelo),
o que reduz a mistura mas não a impede, e transfere a responsabilidade de manter a
organização do sistema para a disciplina de cadastro de uma pessoa não-técnica.

## Decisão
Adotar o padrão usado por sistemas de e-commerce estabelecidos (tags/atributos de
produto no Shopify, atributos e tags no WooCommerce, atributos customizados no Magento):
a ordem de exibição não depende da ordem de cadastro, e sim de um atributo do próprio
produto, aplicado na hora de renderizar a grade.

Concretamente: foi adicionado um campo booleano `com_modelo` ao schema do produto em
`public/admin/config.yml` (widget `boolean`, exibido no painel como o interruptor "Foto
com modelo?"), as 106 peças já cadastradas foram retroativamente marcadas (27 como
`true`, 79 como `false`, com base na classificação visual já feita durante a correção
anterior), e `public/js/script.js` passou a ordenar o array `products` por esse campo
logo após buscar o `produtos.json` (`products.sort(...)`, comparação estável, então a
ordem relativa dentro de cada grupo não muda) — antes de qualquer filtro ou renderização.

## Consequências
- **Benefícios:** a organização do catálogo (sem modelo antes de com modelo) deixa de
  depender da ordem de cadastro ou de qualquer reorganização manual futura — o site se
  organiza sozinho a cada carregamento, não importa em que ordem ou lote a Andreia
  cadastre peças novas pelo painel. Segue o mesmo princípio de Single Source of Truth já
  adotado no ADR-0003 (categorias derivadas dos produtos, não mantidas à parte): a
  classificação vive no produto, e a exibição é só um reflexo automático dela.
- **Riscos/limitações:** o campo depende de preenchimento humano — nada no sistema
  verifica se a foto realmente mostra ou não um modelo, então uma peça cadastrada com o
  interruptor no estado errado aparece no grupo errado sem nenhum aviso. O esquema
  também está limitado a duas categorias (com modelo / sem modelo); se surgir uma
  terceira classificação no futuro (por exemplo, vídeo do produto), o campo booleano
  precisaria virar uma seleção com mais opções.
- **Impactos:** o schema de produto em `config.yml` ganhou um campo novo; os 106 produtos
  existentes no `produtos.json` foram todos retroativamente marcados; `script.js` agora
  depende de uma etapa de ordenação logo após o carregamento dos dados — qualquer
  alteração futura em `carregarDados()` precisa preservar essa etapa, ou a organização
  sem-modelo/com-modelo se perde silenciosamente.
