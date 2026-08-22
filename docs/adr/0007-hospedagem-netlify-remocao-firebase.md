# ADR-0007: Hospedagem definitiva no Netlify — remoção do Firebase do projeto

**Status:** Aceito
**Data:** 2026-08-22
**Substitui:** ADR-0002

## Contexto
O ADR-0002 decidiu, ainda na fase de protótipo, hospedar o projeto no Firebase
Hosting, pelo mesmo ecossistema do Firestore/Firebase Authentication planejados
para a versão de produção. Na prática, porém, o projeto evoluiu por outro caminho:
o Firestore foi abandonado (dados do catálogo migrados para `produtos.json` local,
já registrado no histórico de commits) e o painel administrativo passou a usar
Decap CMS com autenticação via DecapBridge, cujo backend (`git-gateway`) publica
direto no GitHub — sem qualquer dependência do Firebase.

O deploy real e ativo do site e do painel, hoje, acontece inteiramente pelo
Netlify (publicação automática a cada commit em `main`). O Firebase Hosting não é
mais atualizado nem usado para servir o site ao público. Além disso, o arquivo
`public/firebase-config.js` (que inicializava conexão com Firestore) não é
referenciado em nenhum lugar de `public/index.html` ou `public/js/script.js` —
era código morto. O projeto também mantinha localmente `firebase.json`,
`.firebaserc`, arquivos de cache do CLI do Firebase (`.firebase/`) e a
`serviceAccountKey.json` (chave de administrador do Firebase, tratada como risco
de segurança no ADR-0006), sem nenhum uso real.

## Decisão
Tratar o Netlify como a plataforma de hospedagem e deploy definitiva e única
deste projeto. Remover do projeto os artefatos do Firebase que não têm mais
função: `firebase.json`, `.firebaserc`, a pasta `.firebase/` (cache do CLI),
`public/firebase-config.js` (código morto) e a `serviceAccountKey.json` local.

## Consequências
- **Benefícios:** elimina configuração e credenciais mortas do projeto,
  reduzindo superfície de risco (a `serviceAccountKey.json` concedia acesso total
  de administrador ao projeto Firebase, ver ADR-0006); simplifica o mental model
  do projeto — existe uma única plataforma de deploy, não duas coexistindo sem
  função clara; remove código morto (`firebase-config.js`) que poderia confundir
  quem lesse o projeto depois, sugerindo uma dependência que não existe mais.
- **Riscos/limitações:** os scripts de migração antigos em `scripts/`
  (notadamente `teste-admin.js`) ainda referenciam a `serviceAccountKey.json`
  removida e ficarão quebrados se executados — eram scripts de uma migração já
  concluída (Firestore → `produtos.json`), então isso não afeta o site em
  produção, mas fica como débito técnico a ser limpo numa próxima passada. Esta
  decisão vale para o projeto Andreia Pateis especificamente; o ADR-0002 descrevia
  Firebase Hosting como padrão para outros projetos da ELIDAVY TECH — se esse
  padrão de agência também deve mudar é uma decisão separada, fora do escopo
  deste ADR.
- **Impactos:** hospedagem, deploy, autenticação do painel e dados do catálogo
  passam a depender exclusivamente de Netlify + DecapBridge + GitHub. Qualquer
  necessidade futura de banco de dados real (ver limitação registrada no
  ADR-0004) deve ser avaliada sem pressupor Firestore como escolha padrão.
