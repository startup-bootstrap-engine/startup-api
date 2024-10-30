# Getting Started

Our startup-shared repository contains shared components and utilities that can be used across different projects. For example:

- [Databases schemas](../api/databases/data-interaction.md)
- Reusable utils/hooks/helpers
- Shared interfaces

## Preparing your environment

- Clone [startup-docs](https://github.com/startup-bootstrap-engine/startup-docs) inside of your `~/startup-engine` folder, as suggested in our [general overview](../general-overview/getting-started.md).

- Run `yarn install` to install the dependencies.

- Run `yarn configure` to configure your project. This command will also fetch a .npmrc file to your root folder, which is required to publish package changes to npm.

## Testing Changes Locally

Check [this guide](../general-overview/local-packages.md) to learn how to install and test changes locally, without the need of publishing to npm.
