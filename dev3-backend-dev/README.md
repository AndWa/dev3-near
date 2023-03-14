# DEV3 NEAR REST API

<p align="middle">
  <a href="http://nestjs.com/" target="blank"><img src="./public/tech-stack/nestjs.png" width="200" alt="Nest Logo" /></a>
    <a href="https://nodejs.org/" target="blank"><img src="./public/tech-stack/nodejs.png" width="200" alt="Node Logo" /></a>
  <a href="https://www.mongodb.com/" target="blank"><img src="./public/tech-stack/mongo.png" width="200" alt="Mongo Logo" /></a>
    <a href="https://swagger.io/" target="blank"><img src="./public/tech-stack/swagger.png" width="200" alt="Swagger Logo" /></a>
</p>

## Setup

Install the latest version of NodeJS and Yarn.

Install the latest version of MongoDB.

## Environment Variables

Copy `env.example` to the `.env` and populate it with proper values.
Project also works with multi-environment configurations, so also `.env.dev`,`.env.staging` and `.env.production` files are supported.

## Folder Structure

### /

The root folder contains `env.example` file for configuring environment variables

The`.eslintrc.json` file contains ESLint configuration.

The `.gitignore` file specifying which files GIT should ignore.

The `.prettierrc` config file is used for prettier code formatter.

The `nest-cli.json` contains config for `@nestjs/cli` command-line interface tool.

The `Procfile` file is config for heroku.

The `tsconfig.json` and `tsconfig.build.json` files are used for configuring project to use typescript.

The `README.md` file is the current file you are reading and `yarn.lock` file is the lock file for Yarn.

### /.adminjs

This folder contains files to customize the AdminJs interface.

### /public

This folder contains files that are served by the built-in web server and any images used in the `README.md`.

### /src

This folder contains all backend code files.

### /src/common

This folder contains all common entities, enums, constants and dtos.

### src/config

In config folder there is `configuraton.ts` which is used to load env variables to configuration object.

- `NODE_ENV` - variable is used to determine on which environment is app running
- `port` - is defining on which port is app used
- `database_uri` - is used for database uri/url
- `admin_js` - object is used for all admin varaibles
- `jwt` - object is used for `secret` and `expires_in` variables which are used for defining jwt token settings
- `github` - object contains `token` variable which is used to fetch all contract templates from github and `webhook_secret` is used to ping our api `contract-template/update-contracts` when new contract templates are added to `dev` or `main` git branches
- `aws` - object is used for AWS specific variables like `access_key` and `secret_key` that are used to connect to aws, `bucket_name` and `region` are used to save files on aws
- `start_cron_jobs` - is used to start cron jobs automatically, there is one job `updateTxStatusesCron` for updating transaction status

There is also `valdiation.ts` file which is used for validating env variables.

### src/helpers

This folder contains all helpers that are used in app

### src/modules

This is core code from app.

- `address` module contains all api's for managing user common `wallet` addresses
- `admin-js` module contains config for admin interface by `admin js` npm package
- `app` module is entry module for app
- `auth` module contains all auth code
- `contract` module contains all code for getting contract templates via `contract-template` api
- `deployed-contract` module are apis for all deployed contracts by user
- `file` module is used for uploading files, mostly for project module
- `project` is core module becuase `project_id` is used as ref for most entities
- `task` module is used for managing cron jobs
- `transaction-request` module is used for all transactions that are created through app: `Transaction` or `Payment`
- `user` module is used for managing user apis

### src/utils

This folder contains all utils helpers.

### src/main.ts

This file is app entry and contains `client` and `admin` swagger configuration, also config for bootstrapping app.

### /tests

This folder contains all e2e tests.

## Dependencies

Install the dependencies by running:

```bash
$ yarn install
```

## Launch

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Specification

This backend uses specification under the OpenAPI 3.0 standard.

## Modules

Add new module to `modules` folder and refer to nestjs documentation or on other modules how to configure it.

## Linting

To lint your changes, run the following in the project root folder:

```bash
$ yarn lint
```

### API

The REST API can be accessed at `http://{host}:{port}/api/v1/{endpoint}`.

Where `{host}` is the hostname of your server and `{port}` is the port on which the API is running. The `{endpoint}` is the specific endpoint you are attempting to access.

- There are 2 swagger api specifications `http://{host}:{port}/swagger` used for client apis and `http://{host}:{port}/swagger-admin` used for admin apis like `cron` jobs etc

### Admin

The backend has an administrative panel that can be used for back-office operations. It can be accessed at `http://{host}:{port}/admin/`. Where `{host}` is the hostname of your server and `{port}` is the port on which the API is running.

To authenticate, you will need an admin account on the backend.

## Nest docs

[https://nestjs.com](https://nestjs.com/)
