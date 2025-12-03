# GitHub Actions Workflows

This directory contains the CI/CD workflows for svelte-number-format.

## Workflows

### 1. CI (`ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Steps:**

1. ✅ **Prettier check** - Ensures code is formatted
2. ✅ **ESLint** - Lints JavaScript/TypeScript/Svelte files
3. ✅ **Svelte check** - Type checks Svelte components
4. ✅ **Tests** - Runs all unit tests
5. ✅ **Build** - Packages the library

**Purpose:** Validates code quality on every push and PR

### 2. Deploy (`deploy.yml`)

**Triggers:**

- Push to `main` branch
- Manual workflow dispatch

**Jobs:**

#### Job 1: Test & Lint

1. ✅ **Tests** - Runs all unit tests
2. ✅ **Linting** - Runs prettier and eslint
3. ✅ **Type check** - Validates TypeScript/Svelte types

#### Job 2: Build Site (depends on test job)

1. 📦 **Build** - Builds the demo site
2. 📤 **Upload** - Uploads build artifacts

#### Job 3: Deploy (depends on build job)

1. 🚀 **Deploy** - Deploys to GitHub Pages

**Purpose:** Tests, builds, and deploys the demo site

## Workflow Dependencies

```
Deploy Workflow:
  test → build_site → deploy

CI Workflow:
  test (runs all checks in parallel)
```

## Caching

Both workflows use npm caching to speed up dependency installation:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'
```

## Best Practices

- Uses `npm ci` instead of `npm install` for faster, deterministic installs
- Runs tests before building/deploying
- Uses Node.js 20 LTS
- Caches dependencies for faster runs
- Fails fast if tests don't pass

## Status Badges

Add these to your README:

```markdown
[![CI](https://github.com/pitis/svelte-number-format/actions/workflows/ci.yml/badge.svg)](https://github.com/pitis/svelte-number-format/actions/workflows/ci.yml)
[![Deploy](https://github.com/pitis/svelte-number-format/actions/workflows/deploy.yml/badge.svg)](https://github.com/pitis/svelte-number-format/actions/workflows/deploy.yml)
```
