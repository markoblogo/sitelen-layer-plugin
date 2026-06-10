# Release pipeline: setup and staging run

This project now has two release workflows:

- `.github/workflows/release-preflight.yml` — PR/push sanity preflight
- `.github/workflows/release-publish.yml` — release pipeline with publish + release assets

## 1) Configure required CI secrets

### `NPM_TOKEN`
1. Open repository settings: `Settings > Secrets and variables > Actions`.
2. Add secret:
   - `NPM_TOKEN` with an npm automation token scoped for publish.

> If this secret is missing, the release workflow fails explicitly before `npm publish`.

## 2) `GITHUB_TOKEN` permissions
- Repository setting already expects token with `contents: write`.
- The workflow declares:

```yaml
permissions:
  contents: write
```

which is sufficient for creating/updating GitHub Releases in this repo.

## 3) Staging/manual release run (no npm publish)

Run a dispatch with `dryRun=true` to test:
- tag format validation,
- adapter package build/smoke,
- npm tarball smoke,
- GitHub release creation with attached assets (`*.tgz`, `dist/adapters/*.zip`).

CLI example:

```bash
gh workflow run release-publish.yml \
  --repo markoblogo/sitelen-layer-plugin \
  --field tag="v0.3.0" \
  --field dryRun=true
```

Notes:
- For `workflow_dispatch`, the tag must already exist in the repository.
- In staging mode, npm publish is skipped.

## 4) Production release from tag

After validating staging run and setting `NPM_TOKEN`, create a real release by:

```bash
git tag v0.3.0
git push origin v0.3.0
```

or trigger manually with `dryRun=false`.

For production runs, `package.json` version must match the tag (`vX.Y.Z` → `X.Y.Z`) exactly. The workflow now validates this before build; release is blocked on mismatch.
