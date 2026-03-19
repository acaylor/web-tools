# Web Tools

A collection of handy online tools for developers and people working in IT.

## Features

- Encoders/decoders (Base64, URL, HTML entities, etc.)
- Converters (JSON/YAML/TOML, date/time, color, units, etc.)
- Generators (UUID, token, QR code, RSA keys, etc.)
- Crypto utilities (hash, HMAC, bcrypt, JWT parser, etc.)
- Network tools (IP calculator, MAC lookup, etc.)
- And many more

## Self host

**Docker (GitHub Container Registry):**

```sh
docker run -d --name web-tools --restart unless-stopped -p 8080:80 ghcr.io/acaylor/web-tools:latest
```

## Development

### Setup

```sh
pnpm install
```

### Dev server

```sh
pnpm dev
```

### Build

```sh
pnpm build
```

### Run unit tests

```sh
pnpm test
```

### Lint

```sh
pnpm lint
```

### Create a new tool

```sh
pnpm run script:create:tool my-tool-name
```

This generates boilerplate in `src/tools/my-tool-name/` and adds the import to `src/tools/index.ts`. Add the imported tool to the appropriate category and implement it.

### Recommended IDE setup

[VSCode](https://code.visualstudio.com/) with:

- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur)
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally)

```json
{
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "i18n-ally.localesPaths": ["locales", "src/tools/*/locales"],
  "i18n-ally.keystyle": "nested"
}
```

## Credits

Forked from [it-tools](https://github.com/CorentinTh/it-tools) by [Corentin Thomasset](https://corentin.tech). Original project is no longer maintained.

## License

This project is under the [GNU GPLv3](LICENSE).
