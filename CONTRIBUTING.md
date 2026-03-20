Hi (future) collaborator!

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Where to start?](#where-to-start)
- [Development workflow](#development-workflow)
  - [Requirements](#requirements)
  - [Build](#build)
  - [Serve](#serve)
  - [Test](#test)
  - [Docs](#docs)
  - [Release](#release)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Where to start?

Have a fix or a new feature? Search for corresponding issues first, then create a new one if needed.

# Development workflow

## Requirements

To run this project, you will need:

- Node.js ≥ 18 – [nvm](https://github.com/nvm-sh/nvm#install-script) is recommended
- [Bun](https://bun.sh) – our package manager and build tool

## Getting started

```sh
# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test

# Start development mode (watch + playground)
bun run dev
```

## Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

If your PR includes changes that should be released, add a changeset:

```sh
bun run changeset
```

Select the packages affected by your change, choose the version bump type (major/minor/patch), and write a summary that will appear in the changelog.

## Release

When changesets are merged to `main`, a "Version Packages" PR will be automatically created (or updated). Merging that PR triggers the release workflow:

1. Package versions are bumped
2. CHANGELOGs are updated
3. Packages are published to npm
4. Git tags are created

All `typesense-docsearch-*` packages share the same version number (fixed versioning).
