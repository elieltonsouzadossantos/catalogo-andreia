# ADR-0008: Paleta de cores curada, com nomes específicos por peça

**Status:** Aceito
**Data:** 2026-08-22

## Contexto
O catálogo tinha uma lista fixa de apenas 10 cores (preto, nude, vinho, branco, vermelho,
azul, rosa, marrom, champagne, cinza) usada tanto para as bolinhas de cor exibidas no
site quanto para as opções do campo "Cores disponíveis" no painel administrativo. Ao
planejar a melhoria de foto por cor (troca de foto do produto ao selecionar uma cor),
ficou claro que essa lista não representa a variedade real de cores que a Andreia
trabalha em suas peças de moda íntima.

A Andreia forneceu duas fontes de referência: uma lista textual com cerca de 70 nomes de
cores organizados em 10 famílias (rosas, vermelhos, laranjas, amarelos, verdes, azuis,
roxos, nudes e terrosos, neutros, pretos), e uma página de identidade visual da marca com
o código hexadecimal exato de cada uma dessas 70 cores.

Duas abordagens foram consideradas. A primeira seria deixar a cor de cada peça totalmente
livre (nome + seletor de cor por produto), o que daria flexibilidade total mas quebraria a
consistência visual das bolinhas de cor do catálogo — cada peça poderia acabar com um tom
ligeiramente diferente escolhido "no olho", mesmo representando a mesma cor. A segunda
seria usar apenas uma lista curada e pequena (nos moldes da lista atual de 10 cores), o
que manteria a consistência visual mas obrigaria a Andreia a encaixar cada peça numa cor
genérica que não descreve bem o produto real (ex.: uma peça "rosa choque" cadastrada
apenas como "rosa").

Também foi identificada, na própria página de marca da Andreia, uma inconsistência: o nome
"Terracota" aparecia duas vezes, em famílias diferentes (Laranjas e Nudes e terrosos), com
códigos hexadecimais diferentes (`#E2725B` e `#C9643B`) — um caso real de colisão de nome
que precisou ser resolvido antes de fechar a lista.

## Decisão
Adotar um sistema de cores em duas camadas. A primeira camada é uma **paleta-base curada
de 24 tons**, agrupada pelas mesmas 10 famílias que a Andreia usa, com os códigos
hexadecimais extraídos diretamente da página de marca dela — essa camada define a cor
real de cada bolinha exibida no catálogo, e não é escolhida diretamente por ninguém. A
segunda camada são os **~70 nomes de cores específicos** da Andreia (ex.: "Rosa choque",
"Nude pêssego", "Azul-marinho"), que passam a ser as opções reais do campo "Cores
disponíveis" no painel — cada nome específico é associado, no código do site, a um dos 24
tons-base, de forma transparente para quem usa o painel.

Isso significa que a Andreia continua escolhendo cores clicando em opções de uma lista,
exatamente como já fazia — só que agora encontra o nome exato da cor da peça, sem precisar
aprender nada novo nem preencher campo adicional. O nome "Terracota" duplicado foi
resolvido renomeando a ocorrência da família Laranjas para "Terracota alaranjado",
mantendo "Terracota" como o nome exclusivo do tom da família Nudes e terrosos (`#C9643B`).

## Consequências
- **Benefícios:** o catálogo passa a refletir a variedade real de cores que a Andreia
  vende, com nomes que ela reconhece da própria identidade de marca, sem abrir mão da
  consistência visual das bolinhas (sempre um dos 24 tons-base); a experiência de uso do
  painel não muda para a Andreia — ela continua apenas selecionando cores de uma lista.
- **Riscos/limitações:** a lista de 70 nomes é mais longa de rolar no painel do que a
  lista de 10 anterior; se uma cor genuinamente nova (fora das 70 já mapeadas) surgir no
  futuro, alguém precisa adicioná-la ao código — tanto o nome quanto sua associação a um
  tom-base — não é algo que a Andreia consegue fazer sozinha pelo painel.
- **Impactos:** o campo `cores` em `public/admin/config.yml` passa a listar os ~70 nomes
  específicos, organizados por família. O `script.js` passa a ter uma tabela de associação
  nome específico → cor-base (hex), em vez do dicionário simples de 10 cores atual. Essa
  estrutura também é a base sobre a qual a melhoria de foto por cor (ainda não
  implementada) será construída — cada foto por cor será associada a um desses nomes
  específicos, não a uma cor-base genérica.
