---
sidebar_position: 0
title: Crash Course
---

# Docusaurus 101 Crash Course

Welcome to the Docusaurus 101 Crash Course! This guide will walk you through the most common use cases for building and managing documentation websites using [Docusaurus](https://docusaurus.io/), a modern static site generator.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Configuration](#configuration)
4. [Creating Content](#creating-content)
   - [Writing Markdown Pages](#writing-markdown-pages)
   - [Adding a Blog](#adding-a-blog)
   - [Versioning Documentation](#versioning-documentation)
5. [Customizing the Theme](#customizing-the-theme)
6. [Using Plugins](#using-plugins)
7. [Environment Variables](#environment-variables)
8. [Local Development](#local-development)
9. [Building the Site](#building-the-site)
10. [Deployment](#deployment)
    - [Using SSH](#using-ssh)
    - [Without SSH](#without-ssh)
11. [Common Use Cases](#common-use-cases)
12. [Additional Resources](#additional-resources)

---

## Introduction

Docusaurus is a powerful, flexible static site generator tailored for building documentation websites, blogs, and more. It offers a seamless developer experience with features like versioning, localization, and theming out of the box.

### Getting Started

Simply run these 3 commands to get started:

First time only:

```bash
yarn install
yarn configure
```

Every time you want to start the development server:

```bash
yarn dev
```

---

## Prerequisites

Before getting started with Docusaurus, ensure you have the following installed on your system:

- **[Node.js](https://nodejs.org/en/download/):** Version 18.20.4 or higher.
- **[Yarn](https://yarnpkg.com/getting-started/install):** Preferred package manager for Docusaurus projects.

_Alternatively, you can use `npm`, but Yarn is recommended for better performance and consistency._

---

## Configuration

The primary configuration file for a Docusaurus site is `docusaurus.config.js` or `docusaurus.config.ts` if using TypeScript.

### Key Configuration Options

- **`title` & `tagline`:** Define the site's title and tagline.
- **`url` & `baseUrl`:** Set the base URL for your site.
- **`favicon`:** Path to the favicon icon.
- **`themeConfig`:** Customize the theme, navbar, footer, etc.
- **`presets`:** Configure presets like `classic` for standard features.
- **`plugins`:** Add additional functionality via plugins.

### Example `docusaurus.config.js`

```javascript
module.exports = {
  title: "My Documentation",
  tagline: "Dinosaurs are cool",
  url: "https://your-docusaurus-site.com",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "your-org", // GitHub org/user name
  projectName: "your-repo", // Repo name
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // ... other options
        },
        blog: {
          showReadingTime: true,
          // ... other options
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
```

---

## Creating Content

### Writing Markdown Pages

Docusaurus uses Markdown for content creation. Place your Markdown files in the `docs` directory.

- **Example: `docs/intro.md`**

  ```markdown
  ---
  id: intro
  title: Introduction
  ---

  # Welcome to My Documentation

  This is the introduction page.
  ```

### Adding a Blog

To add a blog to your site:

1. **Create Blog Directory**

   Ensure a `blog` directory exists at the root of your project.

2. **Add Blog Posts**

   Create Markdown files within the `blog` directory.

   - **Example: `blog/my-first-post.md`**

     ```markdown
     ---
     title: My First Post
     author: John Doe
     ---

     # My First Blog Post

     Welcome to my first blog post!
     ```

3. **Configure Blog Settings**

   Adjust blog settings in `docusaurus.config.js` under the `presets` section.

### Versioning Documentation

Docusaurus supports versioned documentation, allowing you to maintain multiple versions of your docs.

1. **Create a Version**

   ```bash
   yarn docusaurus docs:version 1.0
   ```

2. **Accessing Versions**

   Users can switch between different versions via the version dropdown in the navbar.

---

## Customizing the Theme

Docusaurus comes with a default theme, but you can customize it to fit your brand.

### Adding Custom CSS

Add your custom styles in `src/css/custom.css`.

```css
/* src/css/custom.css */

.header {
  background-color: #282c34;
}
```

### Customizing the Navbar

Modify the `themeConfig.navbar` section in `docusaurus.config.js` to change the navbar items.

```javascript
themeConfig: {
  navbar: {
    title: 'Startup Engine',
    logo: {
      alt: 'Startup Engine Logo',
      src: 'img/logo.svg',
    },
    items: [
      {to: '/docs/intro', label: 'Docs', position: 'left'},
      {to: '/blog', label: 'Blog', position: 'left'},
      {
        href: 'https://github.com/your-org/your-repo',
        label: 'GitHub',
        position: 'right',
      },
    ],
  },
},
```

---

## Using Plugins

Docusaurus allows you to extend functionality using plugins.

### Adding a Plugin

1. **Install the Plugin**

   ```bash
   yarn add @docusaurus/plugin-google-analytics
   ```

2. **Configure the Plugin**

   Add the plugin to the `plugins` array in `docusaurus.config.js`.

   ```javascript
   plugins: [
     [
       '@docusaurus/plugin-google-analytics',
       {
         trackingID: 'YOUR_GOOGLE_ANALYTICS_TRACKING_ID',
         anonymizeIP: true,
       },
     ],
   ],
   ```

### Popular Plugins

- **SEO Plugin:** Enhances search engine optimization.
- **PWA Plugin:** Adds Progressive Web App support.
- **Sitemap Plugin:** Automatically generates a sitemap.

---

## Environment Variables

Environment variables can be managed within the `docusaurus.config.js` using the `customFields` object.

### Using `customFields`

```javascript
module.exports = {
  // ... other config
  customFields: {
    apiUrl: process.env.API_URL || "https://api.example.com",
  },
};
```

### Accessing Custom Fields in Code

```javascript
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

function MyComponent() {
  const { siteConfig } = useDocusaurusContext();
  return <div>API URL: {siteConfig.customFields.apiUrl}</div>;
}
```

---

## Local Development

To start a local development server with live reloading:

```bash
yarn start
```

- **What It Does:**
  - Launches a local server at `http://localhost:3000`.
  - Opens the site in your default browser.
  - Watches for file changes and reloads automatically.

### Enabling Search

To enable search, please start the server with `yarn start` command instead of `yarn dev`.

---

## Building the Site

To generate the static files for production:

```bash
yarn build
```

- **Output:** The static site is generated in the `build` directory.
- **Next Steps:** You can serve these files using any static hosting service like GitHub Pages, Netlify, Vercel, etc.

---

## Deployment

Docusaurus provides convenient commands for deploying your site. Below are methods using SSH and without SSH.

### Using SSH

If you prefer deploying via SSH (e.g., to a VPS):

```bash
USE_SSH=true yarn deploy
```

- **What It Does:**
  - Builds the site.
  - Deploys the `build` directory to your specified server via SSH.

### Without SSH

For deployments without SSH, such as pushing to GitHub Pages:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

- **What It Does:**
  - Builds the site.
  - Pushes the `build` directory to the `gh-pages` branch of your repository.

**Note:** Ensure you have the necessary permissions and repository settings configured for GitHub Pages.

---

## Common Use Cases

### Adding a Custom Page

1. **Create a React Component**

   ```jsx
   // src/pages/custom.js
   import React from "react";

   function CustomPage() {
     return <div>This is a custom page.</div>;
   }

   export default CustomPage;
   ```

2. **Access the Page**

   Navigate to `http://localhost:3000/custom` to view the custom page.

### Internationalization (i18n)

1. **Configure i18n in `docusaurus.config.js`**

   ```javascript
   module.exports = {
     // ... other config
     i18n: {
       defaultLocale: "en",
       locales: ["en", "fr", "es"],
     },
   };
   ```

2. **Add Translations**

   Create corresponding `docs` and `blog` content for each locale.

### Integrating Search

Docusaurus supports search integration via plugins like Algolia.

1. **Install Algolia Plugin**

   ```bash
   yarn add @docusaurus/plugin-google-analytics
   ```

2. **Configure in `docusaurus.config.js`**

   ```javascript
   themeConfig: {
     algolia: {
       apiKey: 'YOUR_ALGOLIA_API_KEY',
       indexName: 'YOUR_INDEX_NAME',
       appId: 'YOUR_APP_ID',
     },
   },
   ```

### Adding Custom Plugins or Themes

1. **Install the Plugin/Theme**

   ```bash
   yarn add your-plugin-or-theme
   ```

2. **Configure in `docusaurus.config.js`**

   ```javascript
   plugins: ['your-plugin'],
   themes: ['your-theme'],
   ```

---

## Additional Resources

- **[Docusaurus Official Documentation](https://docusaurus.io/docs)**
- **[Docusaurus GitHub Repository](https://github.com/facebook/docusaurus)**
- **[Docusaurus Discord Community](https://discord.gg/docusaurus)**
- **[Docusaurus Showcase](https://docusaurus.io/showcase)**

---

Happy documenting!
