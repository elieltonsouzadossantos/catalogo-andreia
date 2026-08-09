# ADR-0005: Adiar migração para SSR/SSG e separação de camadas até a fase de produção

**Status:** Aceito
**Data:** 2026-08-08

## Contexto
Para um futuro em que o catálogo seja indexado e pesquisado no Google (SEO), o
projeto precisará migrar do modelo atual — SPA (Single Page Application), onde o
conteúdo só existe depois que o JavaScript roda no navegador do visitante — para um
modelo de SSR (Server-Side Rendering) ou SSG (Static Site Generation), onde cada
produto tem uma URL própria e o HTML já chega pronto ao navegador (e ao Google).

Essa migração não é um ajuste incremental: exige adotar um framework dedicado
(ex: Next.js, Astro), reestruturar a forma como os dados são buscados, e mudar o
processo de deploy. Para preparar o terreno, seria possível já reorganizar o código
atual separando a lógica de "onde os dados vêm" (data layer) da lógica de
"como a tela é desenhada" (view layer) — princípio de separação de responsabilidades
que reduziria o esforço da migração futura.

## Decisão
Adiar tanto a migração para SSR/SSG quanto o refactor preparatório de separação de
camadas até a fase de produção do projeto, quando um ambiente de testes/staging
separado do ambiente de produção estiver estabelecido. Nenhuma dessas mudanças será
feita durante a fase atual de protótipo/validação com a cliente.

## Consequências
- **Benefícios:** evita reorganizar código duas vezes (uma agora, sem ambiente de
  teste formal, e outra na migração real); reduz risco de instabilidade introduzida
  em um momento onde qualquer erro exigiria retestar manualmente todo o fluxo com a
  cliente; mantém o foco atual no que importa agora — validação visual e de conteúdo
  do catálogo.
- **Riscos/limitações:** o catálogo permanece sem otimização de SEO por tempo
  indeterminado — não aparecerá bem em buscas do Google enquanto essa decisão não for
  revisitada; o refactor de separação de camadas, se adiado por muito tempo e o
  catálogo crescer bastante antes disso, pode ficar mais custoso de aplicar do que
  seria hoje (mais produtos, mais funções acopladas à lógica de dados).
- **Impactos:** a criação de um ambiente de testes/staging separado da produção passa
  a ser um pré-requisito explícito antes de iniciar a migração SSR/SSG — deve ser
  parte do escopo da fase de produção (junto com Firestore e painel admin), não uma
  etapa posterior a ela.
