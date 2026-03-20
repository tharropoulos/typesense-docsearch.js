---
title: Styling
---

:::info

The following content is for **[DocSearch v3][2]**.
If you are using **[DocSearch v2][3]**, see the **[legacy][4]** documentation.

If you are looking for **DocSearch v4**, see the documentation **[here][5]**.

:::

:::caution

This documentation is in progress.

:::

## Introduction

DocSearch v3 comes with a theme package called `typesense-docsearch-css`, which offers a sleek out of the box theme!

:::note

This package is a dependency of [`typesense-docsearch.js`][1] and [`typesense-docsearch-react`][1], you don't need to install it if you are using a package manager!

:::

## Installation

```bash
yarn add typesense-docsearch-css@3
# or
npm install typesense-docsearch-css@3
```

If you don’t want to use a package manager, you can use a standalone endpoint:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/typesense-docsearch-css@3" />
```

## Files

```
typesense-docsearch-css
├── dist/style.css # all styles
├── dist/_variables.css # CSS variables
├── dist/button.css # CSS for the button
└── dist/modal.css # CSS for the modal
```

[1]: /docs/v3/docsearch
[2]: https://github.com/algolia/docsearch/
[3]: https://github.com/algolia/docsearch/tree/master
[4]: /docs/legacy/dropdown
[5]: /docs/docsearch
