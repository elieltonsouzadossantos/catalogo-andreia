# ADR-0004: Finalização de pedido via link wa.me, sem checkout de pagamento próprio

**Status:** Aceito
**Data:** 2026-08-04

## Contexto
O catálogo precisa de um mecanismo de finalização de pedido. Construir um checkout
de pagamento próprio (gateway de pagamento, gestão de pedidos no banco, emissão de
nota) é um escopo de e-commerce completo, com custo de desenvolvimento e manutenção
muito acima da necessidade atual da cliente, que hoje negocia e recebe pagamento
diretamente pelo WhatsApp.

## Decisão
O carrinho monta um resumo do pedido (itens, tamanho, cor, quantidade, total) e o
converte em uma mensagem pré-formatada, aberta via link `https://wa.me/<numero>?text=<mensagem>`
(API oficial de "click-to-chat" da Meta). A negociação final, pagamento e confirmação
continuam acontecendo na conversa de WhatsApp entre cliente final e Andreia.

## Consequências
- **Benefícios:** zero custo de gateway de pagamento; zero necessidade de gerenciar
  estoque em tempo real ou reconciliação financeira no sistema; implementação simples
  e sem dependência de serviços de terceiros pagos; mantém o canal de atendimento que
  a cliente já domina e prefere.
- **Riscos/limitações:** não há registro automático do pedido em banco de dados —
  todo o histórico de vendas fica apenas nas conversas de WhatsApp da cliente, sem
  relatórios ou métricas automatizadas; não há confirmação de pagamento automática nem
  controle de estoque em tempo real.
- **Impactos:** se o volume de vendas justificar no futuro, uma nova decisão
  (ADR futuro) deverá avaliar a introdução de um gateway de pagamento e registro de
  pedidos em Firestore — por ora, fora do escopo.
