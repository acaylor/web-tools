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

## Releases

Releases use semantic versions: `major.minor.patch`, with Git tags such as `v0.2.0`. Use patch releases for compatible fixes and minor releases for new functionality or substantial maintenance updates. Once the project reaches 1.0, incompatible changes require a major release; while it is 0.x, use a new minor version for incompatible changes. Dependency major versions do not automatically determine the application version. The workflow currently supports stable releases only, without prerelease or build suffixes.

Keep notable changes under `## Unreleased` in [CHANGELOG.md](CHANGELOG.md). Start from current main with a clean working tree and create a release branch. For example:

```sh
git switch main
git pull --ff-only
git fetch origin --tags
git switch -c release/v0.2.0
# Commit any edits to the Unreleased notes before running the release script.
pnpm release 0.2.0 --dry-run
pnpm release 0.2.0 --yes
```

The script promotes the curated Unreleased notes to `## Version 0.2.0`, leaves an empty Unreleased section for future changes, updates `package.json`, and creates one release commit. It rejects invalid or non-increasing versions, existing tags, missing notes, and uncommitted changes. It does not push or create a tag during preparation.

Run the checks and open a pull request:

```sh
pnpm test:release
pnpm lint
pnpm typecheck
pnpm test:unit --run
pnpm build
pnpm test:e2e
git push -u origin release/v0.2.0
gh pr create --base main --title "Release v0.2.0"
```

After the PR checks pass and the release PR is merged, create and push the tag from main:

```sh
git switch main
git pull --ff-only
git fetch origin --tags
pnpm release 0.2.0 --tag --dry-run
pnpm release 0.2.0 --tag --yes
git push origin v0.2.0
```

Tagging checks that main matches the fetched `origin/main` and that the package version and release notes match the requested version. Pushing the tag starts the release workflow, which validates that version, publishes multi-platform Docker images tagged `0.2.0` and `latest`, and publishes a GitHub release with a ZIP of the built app and the matching changelog entry. Monitor the workflow with `gh run list --workflow releases.yml`. Use `pnpm release 0.2.0 --verify` to check release metadata without modifying files or Git history.

## Credits

Forked from [it-tools](https://github.com/CorentinTh/it-tools) by [Corentin Thomasset](https://corentin.tech). Original project is no longer maintained.

## License

This project is under the [GNU GPLv3](LICENSE).
