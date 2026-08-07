# ADR-0002: Hospedagem em Firebase Hosting

**Status:** Aceito
**Data:** 2026-08-04

## Contexto
O projeto precisa de hospedagem para o protótipo (fase de validação com a cliente) e,
depois, para a versão de produção com banco de dados (Firestore) e autenticação
(painel admin). Alternativas avaliadas: GitHub Pages, Netlify, Firebase Hosting.

## Decisão
Usar Firebase Hosting desde o protótipo, em vez de GitHub Pages ou Netlify.

## Consequências
- **Benefícios:** mesmo ecossistema Google que será usado para Firestore (banco de
  dados) e Firebase Authentication (login do painel admin) na versão de produção —
  evita migrar de plataforma no meio do projeto; suporta canais de preview
  (`hosting:channel:deploy`) com expiração automática, ideal para aprovação de cliente
  sem poluir o domínio de produção; já é o padrão usado em outros projetos da
  ELIDAVY TECH (ex: Barros Barbearia), reduzindo curva de aprendizado e reaproveitando
  conhecimento operacional já validado.
- **Riscos/limitações:** exige criação de um projeto Firebase por cliente (não é um
  custo real, mas é um passo manual a mais); dependência do ecossistema Google.
- **Impactos:** todos os próximos projetos de catálogo da ELIDAVY TECH devem seguir
  o mesmo padrão de hospedagem, salvo necessidade específica do cliente.
