# Browser Extension PoC

Proof-of-concept pack for Chrome/Firefox (Manifest V3-compatible) with:
- allowlist/denylist route filtering
- optional allow-list persisted in extension storage
- injected content script
- background script for toggle and persistence

## Files
- `manifest.json`
- `content.js`
- `background.js`

## Install notes
1. Build/package `sitelen-layer-plugin` bundle that can be loaded from extension assets.
2. Replace `PLUGIN_BUNDLE_URL` with real built module path in `content.js`.
3. Load unpacked extension and check allowed routes.
