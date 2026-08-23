# Documentação técnica do catálogo e do painel admin

**ELIDAVY TECH · Referência interna**

Como o site, os dados de produto e o painel de edição da Andreia Pateis funcionam por
baixo do capô — pra consultar sempre que precisar mexer no projeto ou explicar uma
decisão pra alguém.

*Netlify + DecapBridge · Site estático, sem framework · Atualizado em 23/08/2026*

---

## 01. Visão geral

O catálogo da Andreia Pateis é um site estático (HTML + CSS + JavaScript puro, sem
framework) hospedado no Netlify, com deploy automático a cada alteração enviada ao
GitHub. Os produtos vivem num único arquivo JSON dentro do próprio repositório — não há
banco de dados externo. A Andreia edita esse JSON sem tocar em código, através de um
painel visual (Decap CMS) que salva as mudanças direto no GitHub por trás dos panos.

Três serviços externos sustentam esse fluxo, cada um com um papel específico:

- **GitHub** — guarda o código-fonte e o arquivo de produtos; toda alteração vira um
  commit no histórico.
- **Netlify** — publica o site ao público e refaz o deploy automaticamente a cada novo
  commit em `main`.
- **DecapBridge** — cuida do login do painel admin (Google, Microsoft ou e-mail/senha) e
  autoriza o Decap CMS a gravar no GitHub em nome de quem está logado.

## 02. Arquitetura

Não existe backend próprio nem servidor sob gestão — os três serviços acima é que fazem
esse papel.

```
Andreia (painel /admin)
   → autentica via DecapBridge (login OAuth PKCE)
   → edita produto
   → DecapBridge autoriza gravação no GitHub (git-gateway)
GitHub (catalogo-andreia · main)
   → webhook no push avisa o Netlify
Netlify
   → build + deploy automático
   → serve o site + o produtos.json publicado
Cliente final
   → acessa catalogo-andreia.netlify.app
```

O painel admin nunca fala diretamente com o site publicado. Ele grava um commit no
GitHub; é o Netlify, observando esse repositório, quem detecta o push e refaz o deploy —
por isso uma edição no painel leva cerca de um a dois minutos para aparecer no site.

**Frontend público:** SPA (Single Page Application) em JavaScript puro. `index.html`
carrega `script.js`, que busca `produtos.json` por fetch assim que a página abre e monta
a grade, o carrinho e a ficha de cada produto inteiramente no navegador — sem etapa de
build.

**Fonte de dados:** `public/data/produtos/produtos.json` é o único banco de dados do
projeto. Não há Firestore, nem qualquer outro banco externo — só esse arquivo,
versionado como qualquer outro arquivo do repositório.

## 03. Fluxo de edição, passo a passo

O que acontece tecnicamente entre a Andreia clicar em "Publicar" no painel e a alteração
aparecer no site:

1. Ela loga em `/admin` pelo Google, Microsoft ou e-mail/senha — o DecapBridge confere a
   identidade e devolve um token de acesso via OAuth PKCE.
2. O Decap CMS usa esse token pra falar com o git-gateway do DecapBridge, que tem
   permissão de gravação no repositório `catalogo-andreia` no GitHub.
3. Ao salvar um produto, o painel reescreve `produtos.json` por inteiro e cria um commit
   direto na branch `main` — sem passar pelo computador de ninguém.
4. O GitHub avisa o Netlify (via webhook) que a `main` mudou.
5. O Netlify publica o conteúdo da pasta `public/` de novo — não há passo de build (não
   é React/Next/Vite), então essa etapa é essencialmente uma cópia de arquivos, rápida.
6. Na próxima vez que alguém abrir o catálogo, o `script.js` busca o `produtos.json`
   atualizado e a mudança aparece.

**Importante:** como o commit vai direto pro GitHub a partir do painel, um computador
que tenha o projeto clonado localmente (como o seu) pode ficar "atrasado" em relação ao
repositório remoto sempre que alguém usa o painel. É por isso que às vezes é preciso
rodar `git pull` antes de um `git push` — o Git está evitando que uma alteração local
sobrescreva sem querer uma edição feita pelo painel.

## 04. Estrutura de pastas

Só o que importa para operar o projeto — pastas de dependências e controle de versão
foram omitidas.

```
public/                          ← única pasta que o Netlify publica
  index.html                     catálogo (a página que o cliente final vê)
  favicon.png                    logo "AP"; também usado como imagem de
                                  compartilhamento (og:image / twitter:image)
  css/style.css
  js/script.js
  data/produtos/produtos.json    ← "banco de dados" do catálogo
  images/                        fotos dos produtos, upload feito pelo painel
  admin/
    index.html                   carrega o Decap CMS
    config.yml                   define os campos do formulário de produto
docs/adr/                        registro das decisões arquiteturais (ver §06)
scripts/
  reestruturar-produtos-json.js  único script utilitário restante
package.json                     hoje sem dependências
```

## 05. Painel admin

O painel é o Decap CMS (antigo Netlify CMS), configurado inteiramente pelo arquivo
`public/admin/config.yml`. Ele define uma única coleção, `produtos`, ligada ao arquivo
`produtos.json`. Cada produto tem os campos abaixo — mudar essa lista é a forma de mudar
o que a Andreia consegue preencher no formulário:

| Campo | Tipo | Observação |
|---|---|---|
| `nome` | texto | obrigatório |
| `preco` | número | obrigatório, aceita casas decimais |
| `descricao` | texto longo | obrigatório |
| `categoria` | seleção única | lista fixa: Conjunto, Sutiã, Calcinha, Pijama, Cueca, Meia, Camisola |
| `cores` | seleção múltipla | ~70 cores específicas, agrupadas em 10 famílias (rosas, vermelhos, laranjas, amarelos, verdes, azuis, roxos, nudes/terrosos, neutros, pretos), cada uma associada a um de 24 tons-base no `script.js` (ver ADR-0008) |
| `tamanhos` | seleção múltipla | PP, P, M, G, GG, Único |
| `imagem` | upload de imagem | opcional — sem foto, o site mostra um ícone de roupa |
| `imagens_por_cor` | lista (cor + imagem) | opcional — troca a foto exibida quando o cliente seleciona uma cor específica da peça; cada entrada associa uma das ~70 cores a uma imagem |
| `com_modelo` | sim/não | controla se a foto mostra uma pessoa vestindo a peça; determina o agrupamento automático na exibição do catálogo, independente da ordem de cadastro (ver ADR-0009) |
| `destaque` | sim/não | controla o carrossel da tela inicial (exige foto também) |

**Autenticação do painel:** `backend: git-gateway` com `auth_type: pkce` apontando para
`auth.decapbridge.com`. Colaboradores são convidados por e-mail direto no painel do
DecapBridge (decapbridge.com → Gerenciar colaboradores) — é um convite de uso único,
separado do login recorrente de cada pessoa.

## 06. Decisões arquiteturais (ADRs)

O projeto documenta decisões difíceis de reverter em `docs/adr/`. A regra do projeto é
nunca editar um ADR aceito para "corrigi-lo" — se uma decisão muda, um novo ADR é criado
e o antigo é marcado como substituído, preservando o porquê de cada mudança de rumo.

| ADR | Título | Status |
|---|---|---|
| 0001 | Protótipo em arquivo único antes da arquitetura de produção | Aceito |
| 0002 | Hospedagem em Firebase Hosting | Substituído por 0007 |
| 0003 | Categoria e estação como campos separados (filtro facetado) | Aceito |
| 0004 | Finalização de pedido via link wa.me, sem checkout próprio | Aceito |
| 0005 | Adiar migração para SSR/SSG e separação de camadas | Aceito |
| 0006 | Gestão de credenciais em repositórios públicos | Aceito |
| 0007 | Hospedagem definitiva no Netlify — remoção do Firebase | Aceito |
| 0008 | Paleta de cores curada, com nomes específicos por peça | Aceito |
| 0009 | Classificação "com modelo / sem modelo" como campo de dados, não como ordem no arquivo | Aceito |

### As decisões que mudaram a infraestrutura

**ADR-0002 — Hospedagem em Firebase Hosting** *(Substituído por ADR-0007)*
Decisão original da fase de protótipo (04/08/2026): hospedar no Firebase Hosting, no
mesmo ecossistema do Firestore/Firebase Authentication planejados para produção. Na
prática o projeto seguiu outro caminho — o Firestore foi abandonado e o Firebase
Hosting nunca chegou a ser a hospedagem real e ativa do site.

**ADR-0007 — Hospedagem definitiva no Netlify — remoção do Firebase** *(22/08/2026 ·
Aceito)*
*Contexto:* o deploy real e ativo do site sempre aconteceu pelo Netlify, não pelo
Firebase Hosting — o ADR-0002 descrevia um plano que a prática não seguiu. O
`public/firebase-config.js` não era referenciado em lugar nenhum do site (código
morto), e o projeto ainda mantinha localmente `firebase.json`, `.firebaserc`, cache do
CLI do Firebase e a `serviceAccountKey.json` — uma chave de administrador do Firebase
sem nenhum uso real.
*Decisão:* tratar o Netlify como plataforma de hospedagem e deploy definitiva e única do
projeto, e remover todo artefato do Firebase sem função: `firebase.json`, `.firebaserc`,
`.firebase/`, `firebase-config.js` e a chave de administrador local.
*Consequência aceita:* elimina credenciais e configuração mortas do projeto — reduzindo
o risco descrito no ADR-0006 — e alinha a documentação à infraestrutura real. Vale
especificamente para o projeto Andreia Pateis; se o Firebase deve deixar de ser padrão
para outros projetos da ELIDAVY TECH é uma decisão em aberto, fora do escopo deste ADR.

### A decisão mais recente sobre organização do catálogo

**ADR-0009 — Classificação "com modelo / sem modelo" como campo de dados, não como
ordem no arquivo** *(23/08/2026 · Aceito)*
*Contexto:* uma importação em massa de 122 fotos gerou peças com e sem modelo
misturadas na grade do catálogo, porque a exibição sempre segue a ordem do array em
`produtos.json`. Uma correção manual (reordenar o array uma vez) resolveu o sintoma,
mas expôs que o painel sempre adiciona produtos novos no final do array — sem opção de
inserir em outra posição — então a mistura voltaria a acontecer aos poucos conforme a
Andreia cadastrasse peças novas.
*Decisão:* seguir o padrão usado por Shopify, WooCommerce e Magento (tags/atributos de
produto, não ordem de cadastro): adicionar o campo booleano `com_modelo` ao schema,
marcar retroativamente os 106 produtos existentes, e fazer `script.js` ordenar a
exibição por esse campo a cada carregamento — logo, a organização do catálogo deixa de
depender de quando ou em que ordem a Andreia cadastra uma peça.
*Consequência aceita:* a classificação passa a depender de preenchimento humano correto
(nada verifica automaticamente se a foto bate com o valor do campo), e o esquema fica
limitado a duas categorias — uma terceira classificação futura exigiria trocar o campo
booleano por uma seleção. Detalhes completos, incluindo as alternativas descartadas, em
`docs/adr/0009-tag-com-modelo-e-ordenacao-na-exibicao.md`.

Os demais ADRs (0001, 0003–0006, 0008) descrevem decisões de produto e de processo que
continuam válidas como estão — protótipo em arquivo único antes de investir em
infraestrutura, categoria/estação como filtro facetado, checkout via WhatsApp em vez de
gateway de pagamento próprio, SSR/SSG adiado até a fase de produção, a prática de nunca
commitar credenciais, e a paleta de cores curada com nomes específicos por peça. O
histórico completo, com contexto e consequências, está em `docs/adr/`.

## 07. Segurança e acesso

**O repositório é público.** `github.com/elieltonsouzadossantos/catalogo-andreia` é
público — necessário para o deploy automático do Netlify. Qualquer pessoa com o link vê
todo o histórico de commits e todos os arquivos rastreados. Nenhuma credencial (chave de
API, senha, token) pode ser commitada, nunca — nem temporariamente. O `.gitignore` já
protege `serviceAccountKey.json` e `firebase-debug.log`; confirmado que nenhuma
credencial está rastreada no repositório (`git ls-files` não retorna nenhum arquivo de
credencial).

**Acesso ao painel admin.** Só entra quem foi convidado como colaborador pelo
DecapBridge (decapbridge.com → Gerenciar colaboradores). Cada convite é um token de uso
único; depois disso, a pessoa loga normalmente com sua própria conta Google, Microsoft
ou e-mail/senha. Hoje têm acesso: Elielton (desenvolvedor) e Andreia (cliente/dona do
negócio).

**Acesso ao repositório.** O git-gateway do DecapBridge grava commits em nome de quem
está logado no painel — é essa integração, e não uma conta pessoal do GitHub, que tem
permissão de escrita. Acesso direto de escrita ao repositório (via terminal) deve
continuar restrito a quem desenvolve o projeto.

## 08. Débito técnico conhecido

Nada aqui quebra o site em produção — são pontos que valem a pena revisitar numa
próxima passada de limpeza.

**Baixo — Comentários desatualizados em `script.js`.** Dois comentários no código ainda
mencionam Firestore/Firebase (ex.: "Enquanto o catálogo carrega do Firestore..."), mas
os dados já vêm só do `produtos.json` local há tempos. Não afeta o funcionamento, só
pode confundir quem ler o código sem o contexto.

**Baixo — `package-lock.json` desatualizado.** Ainda referencia a dependência
`firebase-admin`, já removida do `package.json`. Rodar `npm install` localmente (no seu
terminal, não pelo ambiente de automação) regenera o arquivo corretamente.

**Baixo — Pasta `admin/` vazia na raiz do projeto.** Sobra do local antigo do painel,
antes de mover para `public/admin/` (correção do 404 documentada no histórico do
projeto). Não é rastreada pelo Git — pode ser apagada manualmente sem nenhum risco.

**Médio — Sem registro automático de pedidos.** Por decisão do ADR-0004, o checkout
acontece via WhatsApp — não existe nenhum banco de dados de pedidos, relatório de vendas
ou controle de estoque automatizado. Se o volume de vendas crescer, vale revisitar essa
decisão.

**Médio — Sem SEO — catálogo não aparece bem no Google.** Por decisão do ADR-0005, a
migração para SSR/SSG (que daria uma URL própria e indexável a cada produto) foi
adiada até a fase de produção. Enquanto isso não muda, o catálogo depende de divulgação
direta (WhatsApp, Instagram, link direto), não de busca orgânica.

**Médio — Fotos sem carregamento sob demanda nem compressão automática.** Hoje o site
carrega a foto de todo produto assim que o catálogo abre (sem lazy loading), e o painel
não redimensiona nem comprime a imagem que a Andreia envia — uma foto direto da câmera
do celular pode passar de 3–4MB. Isso não é um risco imediato (levantamento feito em
22/08/2026: com fotos otimizadas o catálogo aguenta milhares de produtos antes do
armazenamento do GitHub/Netlify virar problema), mas é o que mais rápido consumiria os
100GB de tráfego mensal do plano gratuito do Netlify conforme o catálogo cresce, e
deixaria o carregamento mais lento no celular do cliente. Vale resolver antes do
catálogo crescer bastante: adicionar carregamento sob demanda das imagens e orientar
(ou automatizar) fotos num tamanho mais leve.

## 09. Histórico recente

Os três commits que tiraram o Firebase do projeto e alinharam a documentação à
infraestrutura real (22/08/2026):

- **`1a1b82b`** — Remove pasta `migraçao/` (página de migração única para Firestore, já
  concluída): `migrate.html` e `migrate-data.js` — código morto, importava um
  `firebase-config.js` que já nem existia mais.
- **`7087231`** — Remove scripts de teste/migração do Firebase Admin: `teste-require.js`,
  `teste-admin.js`, `exportar-produtos.js` + dependência `firebase-admin` removida do
  `package.json`.
- **`cb28c1a`** — Remove configuração do Firebase não utilizada e documenta em ADR-0007:
  `firebase.json`, `.firebaserc`, `.firebase/`, `firebase-config.js`,
  `serviceAccountKey.json` local.

**Mudanças de 23/08/2026** (organização do catálogo e compartilhamento do link):

- Campo `com_modelo` adicionado ao schema (`config.yml`) e aplicado retroativamente aos
  106 produtos existentes; `script.js` passou a agrupar a exibição por esse campo.
- `favicon.png` recentralizado (o logo estava deslocado dentro do quadrado da imagem).
- Tags Open Graph e Twitter Card adicionadas em `index.html`, corrigindo o preview do
  link do catálogo ao compartilhar no WhatsApp e redes sociais.
- `docs/adr/0009-tag-com-modelo-e-ordenacao-na-exibicao.md` criado, e o índice em
  `docs/adr/README.md` atualizado.

---

*Documentação técnica interna — ELIDAVY TECH · catálogo Andreia Pateis · versão de
23/08/2026, consolidando o conteúdo publicado em 22/08/2026 com as correções da seção
05/06 (campos `cores`/`imagens_por_cor`/`com_modelo` e ADRs 0008/0009, que já existiam
ou foram criados mas ainda não estavam refletidos no documento) e o resumo das mudanças
do dia.*
