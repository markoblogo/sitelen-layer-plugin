# Release Notes — v0.3.6 (in progress)

## Planned scope
- Finalise the v0.3.0-track UI polish and adapter hardening.
- Validate release pipeline with a staged publish (`workflow_dispatch`, `dryRun=true`).
- Publish production release with matching tag + trusted mode (`publishMode=trusted`, `dryRun=false`).

## Validation checklist
- `npm run ci:release`
- `npm run pack:adapters`
- `npm run smoke:adapters`
- `npm run smoke:publication`
- GitHub release contains `dist/adapters/*.zip` and `<package>-<version>.tgz`
