# sitelen-layer-plugin

A **site-owner plugin** for pages that already contain toki pona content.

Listed on ABVX Lab: https://lab.abvx.xyz/

It adds display layers for the same text:

- `latin`
- `sitelen-pona` (recommended bundled-font `ligature-font` path)
- `sitelen-emoji` (mapping-based)

## Quick Start

```ts
import { createSitelenLayerPlugin } from 'sitelen-layer-plugin';
import 'sitelen-layer-plugin/styles.css';
import 'sitelen-layer-plugin/sitelen-pona-font.css';

const plugin = createSitelenLayerPlugin({
  container: '#tok-content',
  threshold: 0.7,
  requireDominantTokiPona: true,
  toggleMode: 'auto'
});

plugin.init();
```

## Framework wrappers

### React

```tsx
'use client';

import { SitelenLayerProvider } from 'sitelen-layer-plugin/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SitelenLayerProvider config={{ container: '#app', defaultLayer: 'sitelen-emoji' }}>{children}</SitelenLayerProvider>;
}
```

### Build helpers (auto-init)

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import sitelenLayerVitePlugin from 'sitelen-layer-plugin/vite-plugin';

export default defineConfig({
  plugins: [
    sitelenLayerVitePlugin({
      autoImportStyle: true,
      autoInit: true,
      container: '#app',
      initConfig: { toggleMount: '#header-toggle', toggleMode: 'inline' }
    })
  ]
});
```

```js
// webpack.config.js
const { SitelenLayerWebpackPlugin } = require('sitelen-layer-plugin/webpack-plugin');

module.exports = {
  plugins: [
    new SitelenLayerWebpackPlugin({
      autoInjectStyles: true,
      autoInit: true,
      initConfig: { container: '#app', showToggle: true }
    })
  ]
};
```

### Theme polishing (size / transition examples)

```ts
import { createSitelenLayerPlugin } from 'sitelen-layer-plugin';

createSitelenLayerPlugin({
  container: '#app',
  toggleSize: 'lg',
  theme: {
    transition: 'fade-blur',
    customCssVars: {
      '--slp-toggle-motion-duration': '220ms',
      '--slp-toggle-collapsed-width': '48px',
      '--slp-toggle-collapsed-height': '48px',
      '--slp-toggle-preview-size': '18px',
      '--slp-toggle-shadow': '0 16px 32px rgba(0, 0, 0, 0.32)',
      '--slp-toggle-preview-font-weight': '700'
    }
  }
}).init();
```

### Vue 3

```ts
import { vSitelenLayer } from 'sitelen-layer-plugin/vue';

app.directive('sitelen-layer', vSitelenLayer);

// <div v-sitelen-layer="{ container: '#app' }">...</div>
```

### Svelte

```svelte
import { sitelenLayerAction } from 'sitelen-layer-plugin/svelte';

<section use:sitelenLayerAction={{ container: '#app', defaultLayer: 'sitelen-emoji' }}>
```

### Next.js

```tsx
'use client';

import { SitelenLayerNextProvider } from 'sitelen-layer-plugin/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SitelenLayerNextProvider config={{ container: '#app' }}>{children}</SitelenLayerNextProvider>;
}
```

### v0.3.0 integration track (PoC docs)

See [docs/V0.3_INTEGRATION_TRACK.md](docs/V0.3_INTEGRATION_TRACK.md) for browser extension and CMS adapter starter patterns (Obsidian / Logseq / WordPress / Ghost).
Migration notes: [docs/MIGRATION_v0.3.0.md](docs/MIGRATION_v0.3.0.md).

Release candidate demo pages:

- `demo/integration/vite-webpack-route-guard.html`
- `demo/integration/extension-csp-flow.html`

Release preflight:

- `npm run pack:adapters`
- `npm run smoke:adapters`
- `npm run smoke:publication`
- `npm run ci:release`

## Copy-Paste Integrations

### 1) Static landing page

```ts
import { createSitelenLayerPlugin } from 'sitelen-layer-plugin';
import 'sitelen-layer-plugin/styles.css';
import 'sitelen-layer-plugin/sitelen-pona-font.css';

createSitelenLayerPlugin({
  container: '#landing-toki-pona',
  defaultLayer: 'latin',
  showToggle: true
}).init();
```

### 2) SPA-like page (route changes)

```ts
import { createSitelenLayerPlugin } from 'sitelen-layer-plugin';
import 'sitelen-layer-plugin/styles.css';

const plugin = createSitelenLayerPlugin({
  container: '#app-main',
  mutationObserver: {
    enabled: true,
    incremental: true,
    debounceMs: 140,
    observeAttributes: false
  },
  spaNavigation: {
    enabled: true,
    patchHistory: true,
    refreshDelayMs: 80
  }
});

plugin.init();
```

### 2b) Auto TP locale profiles (preset helper)

```ts
import {
  createSitelenLayerPluginFromProfiles,
  createTokiPonaLocaleProfiles
} from 'sitelen-layer-plugin';
import 'sitelen-layer-plugin/styles.css';
import 'sitelen-layer-plugin/sitelen-pona-font.css';

const profiles = createTokiPonaLocaleProfiles({
  container: '#tp-content-scope',
  toggleMount: '#sitelen-layer-toggle-mount',
  storageKey: 'toki-free-kit:sitelen-layer',
  tpPathPrefix: '/tp',
  nonTpPathPrefix: '/en',
  debug: true,
  debugOverlay: true,
  mutationObserver: {
    enabled: true,
    incremental: true,
    observeAttributes: false,
    debounceMs: 140
  },
  sitelenPona: {
    fontFamily: "'sitelen seli kiwen asuki', 'nasin nanpa', sans-serif",
    className: 'my-sitelen-pona-layer',
    renderStrategy: 'ligature-font'
  }
});

createSitelenLayerPluginFromProfiles(profiles).init();
```

### 3) Explicit scope with `data-sitelen-layer-scope`

```html
<main id="content">
  <section data-sitelen-layer-scope>
    <!-- only this subtree is analyzed/transformed -->
  </section>
</main>
```

```ts
createSitelenLayerPlugin({ container: '#content' }).init();
```

## Profiles Example

```ts
import { createSitelenLayerPluginFromProfiles } from 'sitelen-layer-plugin';
import 'sitelen-layer-plugin/styles.css';

const plugin = createSitelenLayerPluginFromProfiles(
  [
    {
      id: 'tok-locale',
      priority: 20,
      match: { pathnamePrefix: '/tok/' },
      config: {
        container: '#tok-content',
        defaultLayer: 'sitelen-emoji',
        showToggle: true
      }
    },
    {
      id: 'en-locale',
      priority: 10,
      match: { pathnamePrefix: '/en/' },
      config: {
        container: '#en-content',
        showToggle: false
      }
    }
  ],
  {
    baseConfig: {
      threshold: 0.7,
      onProfileMatch: (id) => console.log('matched profile:', id)
    }
  }
);

plugin.init();
```

Matching priority: highest `priority` wins among matched profiles.

## Tested Real Integrations

These projects validate `sitelen-layer-plugin` as a site-owner display layer on existing toki pona locales:

### toki-free-kit

- Live TP locale: <https://toki-free.abvx.xyz/tp>
- Repo: <https://github.com/markoblogo/toki-free-kit>

Confirmed:

- header-mounted layer switcher near `EN / TP`
- Latin toki pona, `sitelen-emoji`, and `sitelen-pona` modes
- emoji layer transforms TP page content, including header/footer where appropriate
- `sitelen-pona` uses `ligature-font`: latin TP text stays in the DOM and renders as real glyphs through the bundled ligature font
- locale switcher exclusion (`EN/TP` stays unchanged)
- `/en` route unaffected
- compact badge copy (`mani ala`) stays readable across Latin, emoji, and sitelen pona modes

### dao-toki

- Live TP locale: <https://dao-toki.abvx.xyz/tp>
- Repo: <https://github.com/markoblogo/dao-toki>

Confirmed:

- site-owner integration on an existing cleaned `/tp` toki pona locale
- header-mounted layer switcher near `EN / TP`
- Latin toki pona, `sitelen-emoji`, and `sitelen-pona` modes
- emoji layer works well on cleaned TP copy
- `sitelen-pona` renders real glyphs through `ligature-font`
- locale switcher exclusion (`EN/TP` stays unchanged)
- `/en` route unaffected
- production diagnostics overlay disabled

### stoic-wisdom-series

- Live TP locale: <https://stoic.abvx.xyz/tp>
- Repo: <https://github.com/markoblogo/stoic-wisdom-series>

Confirmed:

- site-owner integration on an existing cleaned `/tp` toki pona locale
- header-mounted layer switcher near `EN / TP`
- `/en` remains normal English with only `EN / TP`
- `/tp` supports `TP` (Latin toki pona), `SP` (`ligature-font` sitelen pona), and `🙂` (`sitelen-emoji`)
- emoji layer works on cleaned TP copy
- `sitelen-pona` renders real glyphs through the bundled ligature-capable font
- locale switcher exclusion (`EN/TP` stays unchanged)
- production diagnostics overlay disabled

Runtime fingerprints used for verification:

- toggle labels: `TP / SP / 🙂`
- inline mount + size class: `slp-toggle--mounted`, `slp-toggle--size-lg`
- diagnostics overlay fields during development: `Toggle mode`, `Toggle size`, `Toggle mount`, `Container: main`
- diagnostics verify `sitelenPonaTextRewrite: false` for the recommended SP path

Important: `sitelen-layer-plugin` is a **display-layer plugin** for existing toki pona content, not a machine translation system. Output quality depends on the underlying toki pona copy. For real sitelen pona glyphs, use `ligature-font`; do not rely on arbitrary token-to-symbol replacement. Emoji rendering follows the plugin mapping/protocol.

## Bundled Sitelen Pona Font

The package includes `sitelen seli kiwen asuki`, a ligature-capable sitelen pona font licensed under the SIL Open Font License 1.1. Import the font CSS next to the plugin styles:

```ts
import 'sitelen-layer-plugin/styles.css';
import 'sitelen-layer-plugin/sitelen-pona-font.css';
```

The CSS entry defines `@font-face` for `sitelen seli kiwen asuki` and points to the bundled font asset. Attribution and license notes live in `assets/fonts/README.md` and `assets/fonts/OFL-sitelen-seli-kiwen.txt` in the npm package.

## Additional exports

- `sitelen-layer-plugin/sitelen-emoji-truth` — export only the bundled mapping and metadata.
- `sitelen-layer-plugin/cli` — typed CLI helpers (`scan`, `topUnmappedEmojiFromText`) for programmatic tooling.

```ts
import { topUnmappedEmojiFromText } from 'sitelen-layer-plugin/cli';

const top = topUnmappedEmojiFromText('...some latin text...', 12);
```

## CLI (v0.2.x)

The `sitelen-layer-cli` binary is published via package `bin`:

```bash
npx sitelen-layer-cli scan ./public/index.html
npx sitelen-layer-cli emoji-candidates ./public/index.html --limit 20 --json
```

## CDN / Module usage (experimental)

Built artifacts include `es` and `cjs` formats.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sitelen-layer-plugin@0.1.1/dist/sitelen-layer-plugin.css">

<script type="module">
  import { createSitelenLayerPlugin } from 'https://cdn.jsdelivr.net/npm/sitelen-layer-plugin@0.1.1/dist/sitelen-layer-plugin.js';

  const plugin = createSitelenLayerPlugin({
    container: '#app'
  });
  plugin.init();
</script>
```

For strict CSP setups, either keep the script external-only and set `script-src` accordingly, or avoid inline initialization code.

## Sitelen Pona Font Config Example

```ts
createSitelenLayerPlugin({
  container: '#tok-content',
  layers: ['latin', 'sitelen-pona', 'sitelen-emoji'],
  toggleMount: '#header-lang-area',
  toggleMode: 'auto',
  toggleSize: 'lg',
  toggleLabels: {
    latin: 'TP',
    'sitelen-pona': { text: 'SP', ariaLabel: 'Sitelen pona layer' },
    'sitelen-emoji': { text: '🙂', ariaLabel: 'Sitelen emoji layer' }
  },
  emojiExcludeSelectors: ['header', '.site-logo'],
  sitelenPona: {
    enabled: true,
    fontFamily: "'sitelen seli kiwen asuki', 'nasin nanpa', sans-serif",
    className: 'my-sitelen-pona-layer',
    renderStrategy: 'ligature-font'
  }
}).init();
```

`ligature-font` is the recommended sitelen pona path. It keeps latin toki pona text in the DOM and relies on OpenType ligatures. The package bundles `sitelen seli kiwen asuki` (SIL Open Font License 1.1); import `sitelen-layer-plugin/sitelen-pona-font.css` to use it out of the box. Site owners can still provide another ligature-capable font with `fontFamily`/`fontCssUrl`; `nasin-sitelen-pu` is supported only when the site owner provides a working CSS/font path.

## Sitelen Pona Transform MVP Example

```ts
createSitelenLayerPlugin({
  container: '#tok-content',
  defaultLayer: 'sitelen-pona',
  sitelenPona: {
    enabled: true,
    renderStrategy: 'transform'
  }
}).init();
```

`transform` is an experimental token-based conversion path with subset mapping coverage. It rewrites text nodes and is not the recommended way to get real sitelen pona glyphs. Unknown tokens stay in latin. Coverage is expected to vary by content; tune mapping incrementally only for experimental use cases.

## Sitelen Emoji Mapping Source

The default `sitelen-emoji` mapping is generated from the vendored
`sitelen-emoji-truth` snapshot at `vendor/sitelen-emoji-truth/default-stable.v1.json`.
That snapshot is pinned to the `default-stable.v1` protocol profile and should match:

```text
https://raw.githubusercontent.com/markoblogo/sitelen-emoji-truth/v1.0.0/profiles/default-stable.v1.json
```

Default runtime behavior follows this protocol snapshot. Project-specific names or site vocabulary should not be silently added to the default mapping; use diagnostics (`emojiTopUnmapped`) to decide whether a token belongs upstream, in a future explicit override layer, or should remain latin fallback.

## Toggle Mount And Labels

- `toggleMount`: selector or `Element` mount target.
- `toggleMode`:
1. `'auto'` (default): inline when `toggleMount` exists, otherwise floating.
2. `'inline'`: tries inline mount, falls back to floating if target is missing.
3. `'floating'`: always bottom-right floating widget.
- `toggleSize`: `'sm' | 'md' | 'lg'` (default: `'md'`).
- `toggleLabels`: per-layer custom button content/aria/title/className.
- Default labels (when `toggleLabels` is not provided):
1. `latin`: `TP`
2. `sitelen-pona`: `SP`
3. `sitelen-emoji`: `🙂`

Example:

```ts
createSitelenLayerPlugin({
  container: '#tp-content',
  toggleMount: '#header-toggle', // place next to EN/TP switcher
  toggleMode: 'auto',
  toggleSize: 'lg',
  toggleLabels: {
    latin: 'TP',
    'sitelen-pona': { text: 'SP', ariaLabel: 'Sitelen pona mode' },
    'sitelen-emoji': { text: '😊', ariaLabel: 'Sitelen emoji mode' }
  }
}).init();
```

## What This Does NOT Do

- Does **not** translate from other languages into toki pona.
- Does **not** process text in images / OCR.
- Is **not** a browser extension for arbitrary third-party sites.
- Does **not** guarantee perfect typography on every site without CSS tuning.

## Troubleshooting Sitelen Pona Font

Common issues:

- `sitelen-layer-plugin/sitelen-pona-font.css` was not imported.
- Custom `fontCssUrl` blocked by CSP.
- Font file loads but CSS specificity prevents application.
- Font loaded, but custom site CSS overrides plugin class.
- Font readiness is false in diagnostics/overlay.
- SP glyphs appear as uppercase/collapsed Latin strings such as `MANIALA` because site CSS applies all-caps styling.

Checklist:

1. Verify font URL is allowed by your CSP.
2. Check network panel for font/CSS responses.
3. Confirm diagnostics shows `sitelenPonaFontReady: true`.
4. Apply stronger CSS selector with custom class.
5. In diagnostics, check `sitelenPonaRenderMode`.

Example with stronger specificity:

```css
/* plugin config: sitelenPona.className = "my-sitelen-pona-layer" */
#tok-content.my-sitelen-pona-layer,
#tok-content.my-sitelen-pona-layer * {
  font-family: 'sitelen seli kiwen asuki', 'nasin nanpa', sans-serif !important;
  font-variant-ligatures: common-ligatures discretionary-ligatures;
  font-feature-settings: "liga" 1, "dlig" 1, "calt" 1;
}
```

`ligature-font` note: this path applies styling and OpenType ligatures and does not rewrite text. `font-only` remains as a backward-compatible alias/legacy spelling.

`transform` note: this path performs token replacement with an MVP subset mapping. It is experimental and not a complete sitelen pona grammar/typesetting engine.

If `ligature-font` mode shows collapsed uppercase strings such as `MANIALA` or `OKAMAJOELIPUILO`, fix source spacing/CSS (`text-transform`, `letter-spacing`, caps styles) instead of adding fake mappings. See [`docs/INTEGRATION_PLAYBOOK.md`](./docs/INTEGRATION_PLAYBOOK.md).

## SPA / Observer Recommendations

- Use `mutationObserver.incremental=true` for frequent append/replace UI updates.
- Keep `observeAttributes=false` unless attribute changes materially alter text eligibility.
- Prefer explicit `refresh()` on known route hooks for large route transitions.
- Keep observer settings moderate by default; avoid aggressive full rescans.

## Public API

- `createSitelenLayerPlugin(config)`
- `createSitelenLayerPluginFromProfiles(profiles, options)`
- `plugin.init()`
- `plugin.refresh()`
- `plugin.destroy()`
- `plugin.getDiagnostics()`
- `plugin.getConfig()` (debug helper; returns resolved configuration)
- `plugin.getLayerUsageSnapshot()`
- `plugin.getLayerUsageSnapshot({ since?, timeWindowMs?, maxEntries? })` (windowed usage diagnostics)
- `plugin.getUnmappedSnapshot({ layer?, limit?, since? })`
- `plugin.renderUsageDashboard(container, { since?, timeWindowMs?, maxEntries? })` (lightweight local dashboard)
- `plugin.showDiagnosticsOverlay()` / `plugin.hideDiagnosticsOverlay()`

## Extended Configuration

### Detection

```ts
createSitelenLayerPlugin({
  detection: {
    strategy: 'weighted', // 'simple' | 'weighted'
    lexiconProfile: 'extended', // 'default' | 'extended'
    minTokens: 8,
    rareTokenPenalty: -0.45 // applies to pu/ku/su in weighted strategy
  }
});
```

- `strategy` defaults to `weighted`
- `minTokens` guard prevents unstable short texts
- diagnostics expose `detectionStrategy`, `lexiconProfile`, `ignoredShortTokens`, and `detectorVersion`

### Theme

```ts
createSitelenLayerPlugin({
  theme: {
    transition: 'fade-blur', // 'none' | 'fade' | 'fade-blur'
    customCssVars: {
      '--slp-toggle-bg': 'rgba(14, 24, 64, 0.82)',
      '--slp-toggle-shadow': '0 12px 26px rgba(0,0,0,0.34)',
      '--slp-toggle-collapsed-width': '44px',
      '--slp-toggle-preview-size': '17px'
    }
  }
});
```

Floating toggle now has a collapsed state (default) with a tiny preview glyph; hover/focus expands to full layer buttons.
The collapsed/expanded behavior respects reduced-motion preferences (`prefers-reduced-motion`).

### Telemetry (opt-in)

```ts
createSitelenLayerPlugin({
  telemetry: {
    enabled: true,
    beaconUrl: '/api/sitelen-layer-telemetry',
    sampleRate: 0.2,
    includeLayerUsage: true,
    batchSize: 24,
    flushIntervalMs: 2500,
    maxQueueSize: 240,
    maxRetries: 2,
    retryBackoffMs: 1000,
    hashSalt: 'site-secret-optional'
  }
});
```

Telemetry events are disabled by default (`telemetry` absent/`false`).

## Package Usage

```ts
import { createSitelenLayerPlugin } from 'sitelen-layer-plugin';
import { createSitelenLayerPluginFromProfiles } from 'sitelen-layer-plugin';
import { createTokiPonaLocaleProfiles } from 'sitelen-layer-plugin';
import 'sitelen-layer-plugin/styles.css';
import 'sitelen-layer-plugin/sitelen-pona-font.css';
```

## Deployment Note (CI/Vercel)

- Avoid machine-local dependency paths like `file:/Users/...` or `file:/Downloads/...`.
- Use one of these installation modes for stable deployments:
1. Published npm package (recommended for production).
2. Repo-local vendored `.tgz` file (for controlled pinning).
3. Git dependency only if your release flow includes built `dist` artifacts.

If bundler resolution fails in CI, first check your dependency source and that `dist/` is available to consumers.

Integration checklist and Next.js header-mount recipe:

- [`docs/INTEGRATION_PLAYBOOK.md`](/Users/antonbiletskiy-volokh/Downloads/Projects/sitelen-layer-plugin/docs/INTEGRATION_PLAYBOOK.md)
- Includes a `Deployment verification (runtime fingerprints)` section for live `/tp` checks (`slp-toggle--size-lg`, `TP/SP/🙂`, overlay fields, `Container: main`).

## Key Config (selected)

- `threshold` (default `0.7`)
- `requireDominantTokiPona` (default `true`)
- `toggleMount`, `toggleMode`, `toggleSize`, `toggleLabels`
- `mutationObserver.enabled` / `mutationObserver.incremental`
- `spaNavigation.enabled`
- `emojiExcludeSelectors` (keep nav/header/logo untouched in emoji mode)
- `sitelenPona.fontFamily`, optional `sitelenPona.fontCssUrl`, `sitelenPona.className`
- `sitelenPona.renderStrategy` (`ligature-font`, legacy `font-only`, or experimental `transform` hook)
- `onDiagnostics`, `onLayerChange`, `onProfileMatch`

## Diagnostics

`getDiagnostics()` includes:

- detection: `score`, `threshold`, `eligible`, `totalTokens`, `recognizedTokens`
- layer state: `activeLayer`, `modeSource`, `availableLayers`
- toggle state: `toggleMountMode`, `toggleMountedIn`
- sitelen pona state: `sitelenPonaFontReady`, `sitelenPonaRenderMode`, `sitelenPonaWarning`
- sitelen pona state: `sitelenPonaTextRewrite`, `sitelenPonaReplacementCount`, `sitelenPonaWordTokenCount`, `sitelenPonaCoverageRatio`
- emoji state: `emojiReplacementCount`, `emojiCoverageRatio`
- mapping tuning helpers: `emojiTopUnmapped`, `sitelenPonaTopUnmapped` (top token frequency lists in diagnostics/debug flow)
- profile state: `profileId`, `matchedProfileId`, `matchedProfileReason`
- observer state: `observerStats`
- timing: `lastUpdatedAt`

## QA And Tests

- QA fixtures: `/qa/index.html`
- Manual checklist: `qa/README.md`
- Run automated tests:

```bash
npm run test:run
```

## Development

```bash
npm install
npm run dev
npm run build
```
