## Getting Started

Make sure you are using `yarn` version 1.

To install it globally run:

```bash
npm i -g yarn@1
```

Install Husky:

```bash
yarn run prepare
```

Run the development server:

```bash
yarn dev
```

## Pull environment variables

Install [Vercal CLI](https://vercel.com/docs/cli) globally:

```bash
npm i -g vercel
```

[Link](https://vercel.com/docs/cli/link) the project to Vercel from the root directory:

```bash
vercel link
```

Pull environment variables to `.env.local` file.

```bash
yarn run env:pull
```

## API code generator

```bash
yarn run api:codegen
```
