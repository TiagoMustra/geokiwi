# GeoKiwi no GitHub

O GitHub guarda o código e o histórico das alterações. O Cloudflare Pages distribui a versão pública em https://geokiwi.pages.dev/.

## Trabalhar noutro computador

```sh
git clone https://github.com/TiagoMustra/geokiwi.git
cd geokiwi
corepack enable
pnpm install
pnpm dev
```

Requisitos de execução e comandos alternativos estão no README.

## Guardar uma atualização

Antes de começar, obtém as alterações que já estão no GitHub:

```sh
git pull --ff-only
```

Depois de editar, revê e verifica as alterações:

```sh
git status
git diff
pnpm test
pnpm build
```

Guarda uma versão com uma mensagem que explique o que mudou:

```sh
git add src docs public README.md
# Acrescenta explicitamente outros ficheiros alterados que também queiras guardar.
git commit -m "Describe the change"
git push origin main
```

Um commit é uma versão guardada no histórico local. O push envia os commits para o GitHub. No GitHub, a página Commits mostra as versões e os ficheiros alterados; History mostra o histórico de um ficheiro. Para alterações maiores, podes criar uma branch e abrir um pull request antes de juntar à main.

Os ficheiros .env e .dev.vars, credenciais locais, node_modules, dist e releases são excluídos pelo .gitignore. As perguntas, os mapas, os recursos visuais e as respetivas licenças fazem parte do código versionado.

## Publicar o site

Neste setup, o push atualiza o histórico no GitHub. Para publicar também no Cloudflare, depois de autenticar a tua conta:

```sh
npm run cloudflare:deploy
```

Consulta PUBLICAR-CLOUDFLARE.md para os detalhes. O progresso e os recordes dos jogadores continuam no localStorage do respetivo navegador; não são enviados para o repositório.
