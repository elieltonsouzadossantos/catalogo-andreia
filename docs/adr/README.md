# Architecture Decision Records — Andreia Pateis

Esta pasta registra as decisões arquiteturais importantes do projeto: o quê foi
decidido, por quê, e quais as consequências aceitas conscientemente.

## Quando criar um novo ADR

Crie um ADR quando a decisão for:
- **Difícil ou cara de reverter** (ex: escolha de banco de dados, plataforma de
  hospedagem, modelo de dados)
- **Não óbvia** para quem ler o código depois sem o contexto da conversa que levou
  a ela
- **Uma alternativa foi descartada** e vale registrar por quê, para não reabrir a
  mesma discussão no futuro sem necessidade

Não crie ADR para decisões triviais ou facilmente reversíveis (cor de um botão,
texto de um rótulo, etc.) — isso vira ruído, não documentação útil.

## Como criar um novo ADR

1. Copie `template.md`
2. Nomeie como `000X-titulo-curto-em-kebab-case.md`, com X = próximo número sequencial
3. Preencha Contexto, Decisão e Consequências
4. Marque `Status: Aceito` quando a decisão for definitiva

## Se uma decisão antiga mudar

Nunca edite um ADR aceito para "corrigi-lo". Em vez disso:
1. Crie um novo ADR explicando a nova decisão
2. No ADR novo, referencie qual ADR ele substitui
3. Volte no ADR antigo e mude o Status para `Substituído por ADR-00XX`

Isso preserva o histórico de raciocínio — futuramente, dá pra entender não só o que
foi decidido, mas por que uma decisão anterior deixou de fazer sentido.

## Índice atual

| ADR | Título | Status |
|---|---|---|
| 0001 | Protótipo em arquivo único antes da arquitetura de produção | Aceito |
| 0002 | Hospedagem em Firebase Hosting | Aceito |
| 0003 | Categoria e estação como campos separados (filtro facetado) | Aceito |
| 0004 | Finalização de pedido via link wa.me, sem checkout próprio | Aceito |
| 0005 | Adiar migração para SSR/SSG e separação de camadas até produção | Aceito |
