# Contributing to svelte-number-format

Thank you for considering contributing to svelte-number-format!

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/pitis/svelte-number-format.git
   cd svelte-number-format
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 to see the demo page

## Git Hooks (Husky)

This project uses [Husky](https://typicode.github.io/husky/) to run pre-commit hooks automatically.

### Pre-commit Hook

Before each commit, the following checks run automatically via [lint-staged](https://github.com/okonet/lint-staged):

- **Code formatting**: Runs `prettier --write` on staged files
- **Linting**: Runs `eslint --fix` on JavaScript/TypeScript/Svelte files
- **Tests**: Runs tests related to changed files

If any of these checks fail, the commit will be blocked until issues are fixed.

### Configuration

The hook configuration is in `package.json`:

```json
"lint-staged": {
  "*.{js,ts,svelte}": [
    "prettier --write",
    "eslint --fix"
  ],
  "*.{json,md,css,html}": [
    "prettier --write"
  ],
  "src/**/*.{spec,test}.{js,ts}": [
    "vitest related --run"
  ]
}
```

### Bypassing Hooks (Not Recommended)

If you absolutely need to bypass the hooks (not recommended):

```bash
git commit --no-verify -m "your message"
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the library and demo site
- `npm run test` - Run all tests
- `npm run test:unit` - Run tests in watch mode
- `npm run format` - Format all files with Prettier
- `npm run lint` - Check code with ESLint and Prettier
- `npm run check` - Run Svelte type checking
- `npm run package` - Package the library for publishing
- `npm run deploy` - Deploy demo to GitHub Pages

## Testing

Run tests with:

```bash
npm test
```

For watch mode during development:

```bash
npm run test:unit
```

See [TESTING.md](./TESTING.md) for more details.

## Code Style

- Use **Prettier** for formatting (automatic via pre-commit hook)
- Follow **ESLint** rules (automatic via pre-commit hook)
- Use **TypeScript** for type safety
- Write **tests** for new features

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes
4. Commit your changes (hooks will run automatically)
5. Push to your fork (`git push origin feat/amazing-feature`)
6. Open a Pull Request

### PR Guidelines

- Write clear, descriptive commit messages
- Include tests for new features
- Update documentation as needed
- Ensure all tests pass
- Keep changes focused and atomic

## Component Architecture

### NumericFormat

- Located in `src/lib/NumericFormat.svelte`
- Handles number formatting (currency, percentages, decimals)
- Built on `intl-number-input`
- Tests in `src/lib/NumericFormat.spec.ts`

### PatternFormat

- Located in `src/lib/PatternFormat.svelte`
- Handles pattern-based masking (phone, cards, dates)
- Custom implementation
- Tests in `src/lib/PatternFormat.spec.ts`
- Patterns defined in `src/lib/maskPatterns.ts`

## Adding New Features

### Adding a New Mask Pattern

1. Add the pattern to `src/lib/maskPatterns.ts`:

   ```typescript
   export const MaskPatterns = {
     // ... existing patterns
     YOUR_PATTERN: '###-***-AAA'
   }
   ```

2. Add an example to the demo page (`src/routes/+page.svelte`)

3. Write tests in `src/lib/PatternFormat.spec.ts`

4. Update the README with the new pattern

### Adding a New Number Format Option

1. Options are passed through to `intl-number-input`
2. Add examples to the demo page
3. Update documentation in README
4. Add tests if needed

## Continuous Integration

### GitHub Actions Workflows

Two workflows run automatically:

#### 1. **CI Workflow** (`.github/workflows/ci.yml`)

Runs on every push and PR to `main` or `develop`:

- ✅ Prettier formatting check
- ✅ ESLint linting
- ✅ Svelte type checking
- ✅ Unit tests
- ✅ Package build

#### 2. **Deploy Workflow** (`.github/workflows/deploy.yml`)

Runs on push to `main`:

1. ✅ Tests & linting (must pass)
2. 📦 Build demo site
3. 🚀 Deploy to GitHub Pages

**Important:** The deploy workflow only proceeds if all tests pass!

See [.github/workflows/README.md](.github/workflows/README.md) for details.

## Quality Checks Summary

Your code goes through multiple layers of validation:

1. **Pre-commit (local)** - Husky + lint-staged
   - Formats & lints staged files
   - Runs tests for changed files
2. **CI (GitHub Actions)** - On every push/PR
   - Full test suite
   - Complete linting
   - Type checking
   - Build verification

3. **Deploy (GitHub Actions)** - On main branch
   - All of the above
   - Deploys only if passing

This ensures high code quality and prevents broken code from being deployed! 🛡️

## Questions?

Feel free to open an issue for:

- Bug reports
- Feature requests
- Questions about contributing
- Suggestions for improvement

Thank you for contributing! 🎉
