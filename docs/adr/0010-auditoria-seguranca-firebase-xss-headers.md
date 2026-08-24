# ADR-0010: Auditoria de segurança — exclusão do Firebase abandonado, escape de saída e cabeçalhos de segurança

**Status:** Aceito
**Data:** 24/08/2026

## Contexto
A pedido do desenvolvedor, foi feita uma auditoria de segurança no projeto (24/08/2026),
cobrindo o código-fonte, o histórico completo do Git, a configuração de deploy do
Netlify e os serviços externos ainda associados ao projeto. A auditoria encontrou quatro
pontos:

1. O projeto Firebase "andreia-pateis" (abandonado desde o [ADR-0007](./0007-hospedagem-netlify-remocao-firebase.md),
   mas nunca excluído de fato) ainda existia, com dado real dentro (coleções `produtos`
   e `config/colors` remanescentes da migração antiga), e suas regras do Firestore
   estavam com o padrão de "modo de teste"
   (`allow read, write: if request.time < timestamp.date(2026, 9, 11);`) — ou seja,
   qualquer pessoa, sem autenticação, podia ler ou escrever no banco até 11/09/2026. A
   chave de configuração desse projeto (`apiKey`, `projectId`) continua recuperável no
   histórico público do Git, mesmo tendo sido removida do código atual pelo ADR-0007.
2. Os campos de texto livre de cada produto (`nome`, `descricao`, e o caminho da foto)
   eram inseridos diretamente em `innerHTML` no `script.js`, sem nenhum escape — um
   padrão clássico de XSS armazenado, explorável por quem tivesse acesso de escrita ao
   `produtos.json` (painel ou GitHub direto).
3. O projeto não tinha nenhum cabeçalho de segurança configurado (sem `_headers` nem
   `netlify.toml`) — sem Content-Security-Policy, X-Frame-Options, ou proteções
   equivalentes.
4. O `.gitignore` só cobria os nomes exatos de arquivo que já haviam causado problema
   antes, não padrões genéricos de credencial.

## Decisão
Adotado um pacote de correções, cada uma delimitada ao risco que resolve:

- O projeto Firebase "andreia-pateis" foi **excluído por completo** (não só as regras
  travadas) — decisão preferida a apenas travar as regras porque o projeto não tem
  nenhum uso planejado, e excluir remove a superfície de ataque de vez.
- Duas funções de escape (`escapeHTML` e `escapeForInlineHandler`, essa segunda para o
  caso específico de um valor dinâmico dentro de um atributo `onclick` inline) foram
  adicionadas ao `script.js` e aplicadas a todo texto de produto inserido em HTML —
  grade, ficha do produto, carrossel de destaques e carrinho. Os campos de vocabulário
  fechado do CMS (categoria, cor, tamanho) foram deixados de fora por não serem texto
  livre.
- Um arquivo `public/_headers` foi criado com cabeçalhos de segurança padrão
  (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
  aplicados a todo o site, e um Content-Security-Policy aplicado **só às rotas `/` e
  `/index.html`** — deliberadamente não ao `/admin`, porque o Decap CMS carrega de um
  CDN externo (`unpkg.com`) e um CSP mal calibrado ali quebraria o login da Andreia.
- O `.gitignore` ganhou padrões genéricos (`*serviceAccount*`, `*.pem`, `*.p12`,
  `.env`, `.env.*`) além dos nomes exatos já cobertos.

## Consequências
- **Benefícios:** elimina o único ponto de dado real exposto publicamente sem
  autenticação (o Firestore abandonado); reduz o risco de um valor de produto malicioso
  (inserido por uma conta comprometida, por exemplo) afetar o navegador de quem visita o
  catálogo; adiciona uma camada de defesa em profundidade caso uma injeção ainda assim
  aconteça; e reduz a chance de uma credencial futura ser commitada por descuido.
- **Riscos/limitações:** o CSP precisou manter `'unsafe-inline'` no `script-src`, porque
  o site usa `onclick="..."` inline extensivamente — isso significa que a política ainda
  não bloqueia execução de script inline, só restringe de onde scripts externos podem
  ser carregados; uma correção completa exigiria trocar o padrão de `onclick` inline por
  `addEventListener`, o que é um refactor maior, fora do escopo desta auditoria. O
  `/admin` continua sem CSP nenhum, por depender de um CDN externo — se o Decap CMS
  parar de depender do unpkg.com no futuro, vale revisitar essa exceção.
- **Impactos:** `script.js` ganhou duas funções auxiliares que todo código novo de
  renderização de produto deve usar ao inserir texto vindo do `produtos.json` em HTML;
  `public/_headers` passa a ser um arquivo que precisa ser atualizado sempre que uma
  nova origem externa (CDN, fonte, API) for adicionada ao site, senão o CSP vai bloquear
  o recurso novo; o projeto Firebase não existe mais — qualquer referência futura a ele
  na documentação ou no código é histórica, não funcional.
