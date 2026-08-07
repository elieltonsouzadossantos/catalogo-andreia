# ADR-0001: Protótipo em arquivo único antes da arquitetura de produção

**Status:** Aceito
**Data:** 2026-08-04

## Contexto
A cliente (Andreia Pateis) precisava validar visual, paleta de cores, fluxo de compra e
funcionalidades (carrinho, WhatsApp, localização, compartilhamento) antes de qualquer
investimento em infraestrutura de banco de dados. Construir direto a versão de produção
(Firestore + painel admin) sem aprovação visual arriscava retrabalho caro caso a cliente
pedisse mudanças estruturais depois de já termos modelado dados e regras de segurança.

## Decisão
Construir um protótipo funcional em um único arquivo HTML (CSS + JS inline, dados de
produto fixos no código), hospedado em canal de preview do Firebase Hosting
(`firebase hosting:channel:deploy`), para validação rápida e iterativa com a cliente.

## Consequências
- **Benefícios:** iteração muito rápida (cada ajuste visual = 1 arquivo, 1 deploy);
  zero custo de infraestrutura de dados nessa fase; cliente testa a experiência real
  no celular dela via link, não uma imagem estática.
- **Riscos/limitações:** arquivo cresce em tamanho conforme fotos de produto são
  embutidas em base64 (chegou a ~1,3MB); não deve ser usado como base de produção,
  pois mistura dados com apresentação — decisão a ser revertida no ADR de migração
  para Firestore.
- **Impactos:** exige uma decisão futura explícita (ver ADR-0005, a ser criado) sobre
  o momento e a forma de migrar os produtos para Firestore + Storage antes do lançamento
  real ao público.
