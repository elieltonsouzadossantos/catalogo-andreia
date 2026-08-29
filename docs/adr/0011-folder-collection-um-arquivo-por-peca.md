# ADR-0011: Migração de coleção única para folder collection (um arquivo JSON por peça) no Decap CMS

**Status:** Aceito
**Data:** 2026-08-24

## Contexto
Desde a adoção do Decap CMS, o catálogo era editado como uma **coleção de arquivo
único** (`file collection`): todo o `produtos.json` era um único arquivo, com um
campo `list` contendo todas as peças dentro dele. Isso funcionava bem enquanto o
catálogo era pequeno, mas parou de escalar conforme o número de peças cresceu além
de 100: o widget `list` do Decap re-renderiza a lista inteira a cada edição de
campo (comportamento documentado nas issues públicas do projeto, #3415 e #2293),
o que tornava o painel cada vez mais lento e, em alguns pontos, quase inutilizável
para editar uma peça específica em meio a mais de cem outras no mesmo formulário.

Esse problema se tornou crítico no momento em que ficou definido que a Andreia
precisaria editar as 106 peças do catálogo uma a uma pelo painel — usar uma
coleção de arquivo único nessas condições implicaria carregar e re-renderizar a
lista completa a cada campo alterado, em qualquer uma das 106 edições.

Duas alternativas mais simples foram descartadas: (1) manter a coleção de arquivo
único e simplesmente conviver com a lentidão, rejeitada por travar na prática o
uso do painel na escala necessária; e (2) trocar de CMS inteiramente, rejeitada
por ser uma mudança desproporional ao problema (perderia toda a configuração,
autenticação via DecapBridge e curva de aprendizado já resolvidas) quando o Decap
já oferece um mecanismo nativo para esse caso.

## Decisão
Migrar a coleção `produtos` de `file collection` para **`folder collection`**:
cada peça passou a ser seu próprio arquivo JSON, em
`public/data/produtos/pecas/<slug-do-nome>.json`, com o Decap configurado via
`folder`, `extension: "json"`, `format: "json"`, `identifier_field: "nome"` e
`create: true` — permitindo que o painel crie, edite e exclua peças como
arquivos independentes, sem tocar nos outros 105 durante uma edição.

Como o site (`public/js/script.js`) continuava esperando um único
`produtos.json` no formato `{ "produtos": [...] }`, foi criado o script
`scripts/build-produtos.js`, executado automaticamente a cada publicação (via
`netlify.toml`, `[build] command = "node scripts/build-produtos.js"`), que
concatena todos os arquivos de `public/data/produtos/pecas/*.json` num único
`public/data/produtos/produtos.json` — o mesmo arquivo estático que o site já
buscava antes. Ou seja, a mudança ficou inteiramente do lado de autoria
(painel/Git), sem exigir nenhuma alteração no contrato de dados consumido pelo
front-end.

Durante o rollout, uma omissão foi corrigida no mesmo dia: o `config.yml`
inicial não declarava `extension`/`format` explicitamente, e o Decap assume por
padrão o formato Markdown com front-matter quando esses campos faltam — o
resultado foi o painel exibir "No Entries" mesmo com os 106 arquivos JSON já
presentes no repositório. A correção foi adicionar as duas chaves faltantes ao
schema da coleção.

## Consequências
- **Benefícios:** o painel deixou de re-renderizar 106 peças a cada edição de
  campo — cada peça agora é isolada em seu próprio arquivo, então editar uma não
  tem custo de performance proporcional ao tamanho do catálogo. O histórico do
  Git também ficou mais legível (cada commit de edição toca um arquivo pequeno e
  específico, em vez de um diff dentro de um array gigante). A estrutura abre
  espaço para futuras adições por peça sem impacto de escala (como o campo
  `disponivel` do ADR-0012).
- **Riscos/limitações:** o `produtos.json` versionado no Git tornou-se um
  **retrato estático do momento da migração** — ele não é mais atualizado no
  repositório após cada build (só é regenerado no ambiente efêmero do Netlify,
  como saída de build, não commitado de volta). Isso é esperado e não é um bug,
  mas pode confundir quem inspecionar o histórico do Git no futuro esperando que
  esse arquivo reflita o catálogo atual. A publicação do site também passou a
  depender rigidamente da execução do `scripts/build-produtos.js` a cada deploy
  — se a configuração de build do `netlify.toml` for perdida ou alterada por
  engano, o site continuaria servindo dados desatualizados sem erro visível.
- **Impactos:** qualquer ferramenta ou script futuro que precise ler o catálogo
  completo deve iterar sobre `public/data/produtos/pecas/*.json`, não sobre o
  `produtos.json` do repositório. Peças novas cadastradas pelo painel a partir de
  agora chegam como arquivos individuais nessa pasta. O contrato de dados do
  front-end (`produtos.json` no formato `{ "produtos": [...] }`) permanece
  inalterado.
