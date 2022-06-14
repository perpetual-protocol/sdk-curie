![Cover](https://user-images.githubusercontent.com/5022617/167766554-055c9785-00ec-4a5a-86ac-a4b3e1a42e76.png)

# Perpetual Protocol Curie SDK (BETA)

A Javascript SDK for Perpetual Protocol Curie.
`This repo is still in beta.`

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Usage

## Install

Install dependencies:

```bash
yarn add @perp/sdk-curie
```

See `./test/` for common use cases.

# Development

## Environment Variables

```javascript
enum TRACK {
  dev1 = "dev1"
  dev2 = "dev2"
  canary = "canary"
  rc = "rc"
  production = "production"
}

METADATA_URL_CORE_OVERRIDE_OPTIMISM_KOVAN
METADATA_URL_CORE_OVERRIDE_OPTIMISM
METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM_KOVAN
METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM
```

## Setup before development

```bash
yarn
yarn generate-type:[TRACK]
```

## Testing in other projects

In this repo, run:

```bash
yarn link
yarn start:[TRACK]
```

### To supply custom envs, run:

```bash
METADATA_URL_CORE_OVERRIDE_OPTIMISM_KOVAN="your_url" \
METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM_KOVAN="your_url" \
yarn start:[TRACK]
```

In the repo that you want to test with, run:

```bash
yarn link @perp/sdk-curie
```

##

## Commit

We use `commitizen` and `commitlint` to regulate commit message.

```bash
yarn commit
```

## Test

```
 yarn test
```
