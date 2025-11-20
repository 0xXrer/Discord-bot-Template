# Publishing Guide for create-discord-bot-oceanic

## Prerequisites

1. **npm account** - Create one at https://www.npmjs.com/signup
2. **npm login** - Run `npm login` to authenticate

## Publishing Steps

### 1. Update Version

Update the version in `package.json`:

```json
{
  "version": "2.0.0"
}
```

Follow semantic versioning (semver):
- **Major** (x.0.0) - Breaking changes
- **Minor** (2.x.0) - New features, backwards compatible
- **Patch** (2.0.x) - Bug fixes

### 2. Build the CLI

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Generate source maps
- Create declaration files
- Output to `dist/` directory

### 3. Test Locally

Before publishing, test the CLI locally:

```bash
# Test with npm
npm link
create-discord-bot test-project

# Or test directly
node dist/index.js test-project
```

Clean up test project:
```bash
rm -rf test-project
npm unlink
```

### 4. Verify Package Contents

Check what will be published:

```bash
npm pack --dry-run
```

This shows all files that will be included in the package.

### 5. Publish to npm

#### First time publishing:

```bash
npm publish
```

#### Publishing updates:

```bash
# Bump version
npm version patch  # or minor, major

# Build
npm run build

# Publish
npm publish
```

### 6. Verify Publication

Check the package on npm:
```
https://www.npmjs.com/package/create-discord-bot-oceanic
```

Test installation:
```bash
npx create-discord-bot-oceanic@latest test-bot
```

## Publishing Checklist

Before each publish:

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` (create if doesn't exist)
- [ ] Run `npm run build` successfully
- [ ] Test CLI locally with `npm link`
- [ ] Verify package contents with `npm pack --dry-run`
- [ ] Commit all changes to git
- [ ] Tag the release: `git tag v2.0.0`
- [ ] Push tags: `git push --tags`
- [ ] Run `npm publish`
- [ ] Test installation from npm

## Automation with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci
        working-directory: ./cli

      - name: Build
        run: npm run build
        working-directory: ./cli

      - name: Publish
        run: npm publish
        working-directory: ./cli
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Beta Releases

Publish beta versions for testing:

```bash
# Update version to beta
npm version 2.1.0-beta.0

# Publish with beta tag
npm publish --tag beta
```

Install beta version:
```bash
npx create-discord-bot-oceanic@beta test-bot
```

## Troubleshooting

### Package name already exists

If `create-discord-bot-oceanic` is taken, try:
- `create-oceanic-discord-bot`
- `create-discord-bot-ts`
- `@your-username/create-discord-bot`

### Permission denied

Run `npm login` to authenticate with npm.

### Version already published

You cannot republish the same version. Increment version:
```bash
npm version patch
```

## Post-Publication

1. **Update documentation** - Add badges to README
2. **Announce** - Share on Discord, Twitter, Reddit
3. **Monitor** - Check npm download stats
4. **Support** - Respond to issues on GitHub

## Useful Commands

```bash
# Check current npm user
npm whoami

# View package info
npm info create-discord-bot-oceanic

# Unpublish (within 72 hours)
npm unpublish create-discord-bot-oceanic@2.0.0

# Deprecate version
npm deprecate create-discord-bot-oceanic@2.0.0 "Use version 2.0.1 instead"
```

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm CLI Documentation](https://docs.npmjs.com/cli/)
