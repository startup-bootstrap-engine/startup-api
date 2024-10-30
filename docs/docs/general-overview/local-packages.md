# Local Packages

When developing and testing npm modules locally, repeatedly publishing to the npm registry can be time-consuming and inefficient. This guide provides step-by-step instructions on how to install npm packages locally for testing purposes, allowing you to streamline your development workflow without the need for constant publishing.

## Linking Local Packages

You can install a npm package locally in your project using the `file:` protocol. This method allows you to use your package without publishing it to the npm registry, which is particularly useful during development and testing.

### Installing with Yarn

If you prefer using Yarn over npm, you can add a local package using the `file:` protocol:

```bash
yarn add file:../path/to/local/package
```

**Example:**

```bash
yarn add file:../rpg-long-bow
```

**Notes:**

- Yarn will link the local package, allowing you to make changes and see them reflected immediately in your project.
- Ensure the local package has a valid `package.json` file.

### Using `npx` for Local Installation

The `npx` command can also be used to install a local package:

```bash
npx install file:/path/to/local/package
```

**Example:**

```bash
npx install file:../my-local-package
```

**Advantages:**

- **Quick Testing**: Useful for quickly testing packages without adding them to your `package.json`.
- **No Permanent Installation**: Does not modify your project's dependencies permanently.

**Caution:** This method is not recommended for production use as it may lead to unpredictable behavior and compatibility issues.

## Testing Local Changes

Testing local changes involves the following steps:

1. **Link the Local Package**: Use one of the installation methods above to add your local package to the project.
2. **Make Changes**: Develop and modify your local package as needed.
3. **Test in Project**: Run your project to test the changes in the context of the client application.
4. **Avoid Publishing Unstable Versions**: Ensure that only stable, tested versions are published to avoid breaking dependencies.

**Benefits:**

- **Efficiency**: Reduces the need to publish multiple versions during development.
- **Immediate Feedback**: Changes in the local package are immediately available in the project.

## Publishing a New Version

Once you have tested your local changes and ensured they work correctly with the client project, you can publish a new version of your package.

**Steps:**

1. **Publish with Yarn**:

   ```bash
   yarn publish
   ```

2. **Version update**: This is automatically done by the publish command.

**Important:** Only publish a new version after thorough testing to ensure compatibility and stability.

## Post-publish steps

After publishing a new version, it's essential to update your code repository to reflect the changes.

**Steps:**

1. **Commit Changes**:

   ```bash
   git add .
   git commit -m "Publish version 12.0.2"
   ```

2. **Push to Master**:

   ```bash
   git push origin master
   ```

**Note:** Pushing to the master branch ensures that the latest changes are available to all collaborators and downstream projects.
