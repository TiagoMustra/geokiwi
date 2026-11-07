# Executar e desenvolver o GeoKiwi


Requisitos: Node.js 22.12+ e pnpm 11.25.0.

```sh
corepack enable
pnpm install
pnpm dev
```

Abra o endereço mostrado no terminal. Para verificar e gerar a versão estática:

```sh
pnpm test
pnpm build
pnpm preview
```

O diretório `dist/` gerado pode ser servido em qualquer hospedagem estática na raiz do domínio. O projeto não requer backend nem contas de jogador. O mapa físico dos modos de aproximação carrega cartografia externa. Os recordes são locais ao navegador e à origem do site. Para hospedar em um subdiretório, ajuste o `base` do Vite e os caminhos absolutos dos assets.


## Guias

- [Guardar alterações no GitHub](GITHUB.md)
- [Publicar no Cloudflare Pages](PUBLICAR-CLOUDFLARE.md)
- [Banco de conhecimento geral](geoguru.md)
