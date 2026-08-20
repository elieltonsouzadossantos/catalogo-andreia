# ADR-0006: Gestão de credenciais em repositórios públicos

**Status:** Aceito
**Data:** 2026-08-20

## Contexto
O repositório do catálogo (`catalogo-andreia`) é público no GitHub, para permitir a
integração de deploy automático com o Netlify. Isso significa que qualquer pessoa com
o link do repositório pode ver todo o histórico de commits e todos os arquivos
rastreados.

Durante a migração dos dados do Firestore para o `produtos.json` local, o arquivo
`serviceAccountKey.json` — a chave de conta de serviço do Firebase Admin, usada pelos
scripts de migração em `scripts/` — foi criado no projeto. Esse arquivo concede
acesso administrativo completo ao projeto Firebase (leitura, escrita e exclusão de
qualquer dado). Se commitado por engano em um repositório público, qualquer pessoa
poderia assumir controle total do projeto Firebase.

Nesse processo, o arquivo só entrou no `.gitignore` depois de já existir no projeto,
por sorte de ordem de trabalho e não por processo definido. Além disso, descobriu-se
que o `.gitignore` estava salvo em codificação UTF-16 LE, o que fazia o Git ignorar
silenciosamente as próprias regras de exclusão — ou seja, mesmo listado no arquivo,
`serviceAccountKey.json` continuava aparecendo como "untracked" e vulnerável a ser
commitado a qualquer momento, sem nenhum erro visível alertando sobre isso.

## Decisão
Adotar, como prática obrigatória para este e futuros projetos com repositório
público, que todo arquivo contendo credenciais, chaves de API, senhas ou tokens (ex:
`serviceAccountKey.json`, arquivos `.env`) seja adicionado ao `.gitignore` antes do
primeiro commit em que esse arquivo passaria a existir no projeto — nunca depois. Ao
editar o `.gitignore`, confirmar que ele está salvo em UTF-8 (verificando o indicador
de codificação no rodapé do editor), e, antes de qualquer `git push`, rodar
`git status` e `git check-ignore -v <arquivo>` para confirmar que nenhuma credencial
aparece como rastreada ou "untracked".

## Consequências
- **Benefícios:** reduz a praticamente zero o risco de vazamento de credenciais
  administrativas em repositórios públicos, desde que o processo seja seguido antes
  de cada commit; documenta um problema real já encontrado (codificação UTF-16
  quebrando o `.gitignore` silenciosamente) para não ser reencontrado do zero em
  outro projeto.
- **Riscos/limitações:** a verificação (`.gitignore` + `git check-ignore`) é manual e
  depende de disciplina antes de cada push com arquivos novos; não protege
  credenciais que já tenham sido commitadas anteriormente ao histórico do Git — nesse
  caso, a correção exigiria reescrever o histórico (`git filter-repo` ou similar) e
  revogar/rotacionar a credencial exposta imediatamente, independente da limpeza do
  repositório.
- **Impactos:** repositórios que armazenam credenciais de administrador (Firebase
  Admin SDK, tokens de API de terceiros, etc.) passam a ser tratados, por padrão,
  como candidatos a repositório privado, a menos que haja uma razão específica para
  serem públicos — como a integração de deploy automático usada neste projeto.
