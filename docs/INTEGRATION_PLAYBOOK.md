# Integration Playbook

Practical checklist for integrating `sitelen-layer-plugin` into real sites (especially Next.js + locale routes).

## 1) Scope First

Always scope transformations to the main toki pona content block.

Preferred:

- add `data-sitelen-layer-scope` on the TP content wrapper
- set `container` to a specific selector

Avoid setting `container: document.body` unless absolutely needed.

## 2) Header-Mounted Toggle (instead of floating widget)

If your site already has a language switcher in the header:

1. Add a mount node near `EN/TP`, e.g. `<div id="sitelen-layer-toggle-mount" />`
2. Pass `toggleMount: '#sitelen-layer-toggle-mount'`
3. Add minimal CSS so toggle looks native in header

This prevents floating bottom-right UI from conflicting with site layout.

## 3) Profiles for Locale Routing

Use profile matching so TP behavior is isolated to TP routes.

- TP profile: `/tp` with all 3 layers enabled
- non-TP profile: `/en` (or fallback) with `showToggle: false`

Use `createTokiPonaLocaleProfiles(...)` for fast setup.

## 4) Next.js Client-Safe Init

- create a `'use client'` component
- initialize plugin in `useEffect`
- call `plugin.destroy()` in cleanup
- do not instantiate plugin in server components

## 5) Vercel / CI-Safe Dependency Strategy

Do not rely on machine-local dependency paths like:

- `file:/Users/...`
- `file:/Downloads/...`

Use one of:

1. Published npm package (recommended)
2. Repo-local vendored tarball (`file:vendor/...tgz`)
3. Git dependency only when your package source includes consumer-ready build artifacts

## 6) Smoke Checklist

On TP route:

- eligibility passes
- toggle visible
- `latin <-> sitelen-emoji`
- `latin <-> sitelen-pona`
- layout intact

On non-TP route:

- toggle hidden
- no unintended text transforms

## 7) Debug Signals

Enable during integration:

- `debug: true`
- `debugOverlay: true`

Check:

- `matchedProfileId`
- `matchedProfileReason`
- `sitelenPonaFontReady`
- `observerStats`

## 8) Automation-Ready Baseline Config

Use this as a default integration template in new site-owner projects to avoid repeated UX issues:

```ts
import {
  createSitelenLayerPluginFromProfiles,
  createTokiPonaLocaleProfiles
} from 'sitelen-layer-plugin';
import 'sitelen-layer-plugin/styles.css';
import 'sitelen-layer-plugin/sitelen-pona-font.css';

const profiles = createTokiPonaLocaleProfiles({
  container: '#tp-content',
  tpPathPrefix: '/tp',
  nonTpPathPrefix: '/en',
  toggleMount: '#sitelen-layer-toggle-mount',
  toggleMode: 'auto',
  toggleSize: 'lg',
  toggleLabels: {
    latin: 'TP',
    'sitelen-pona': { text: 'SP', ariaLabel: 'Sitelen pona mode' },
    'sitelen-emoji': { text: '🙂', ariaLabel: 'Sitelen emoji mode' }
  },
  emojiExcludeSelectors: ['header', 'nav', '.site-logo'],
  debug: true,
  debugOverlay: true,
  mutationObserver: {
    enabled: true,
    incremental: true,
    observeAttributes: false,
    debounceMs: 140
  },
  sitelenPona: {
    enabled: true,
    renderStrategy: 'ligature-font',
    fontFamily: "'sitelen seli kiwen asuki', 'nasin nanpa', sans-serif"
  }
});

createSitelenLayerPluginFromProfiles(profiles).init();
```

Operational defaults:

- `toggleMode: 'auto'` keeps inline header mount when available, floating fallback otherwise.
- `toggleSize: 'lg'` improves readability for header/nav integrations.
- `emojiExcludeSelectors` protects nav/header/logo from unnecessary replacement noise.
- `renderStrategy: 'ligature-font'` is the recommended path; it keeps latin text in the DOM and uses the bundled ligature font.
- Use custom fonts only when the site owner has a valid CSS/font path and license. Treat `transform` as experimental text rewriting.


## 8b) Sitelen Pona Font

Default recommendation:

```ts
import 'sitelen-layer-plugin/sitelen-pona-font.css';

createSitelenLayerPlugin({
  sitelenPona: {
    renderStrategy: 'ligature-font',
    fontFamily: "'sitelen seli kiwen asuki', sans-serif"
  }
});
```

The plugin bundles `sitelen seli kiwen asuki` under the SIL Open Font License. Only use a custom `fontCssUrl` when the URL is stable, allowed by CSP, and license-safe.

## 8c) Troubleshooting: SP Glyphs Show As Uppercase Latin

If sitelen pona mode shows strings like `MANIALA`, `JANSONAPINASIN`, or `OKAMAJOELIPUILO`, do not add fake mapping entries for those collapsed forms. The usual cause is site CSS applied before the ligature font:

- `text-transform: uppercase`
- aggressive `letter-spacing`
- all-caps button, badge, or author-label styles

Fix this in the site integration CSS for the active SP layer. Reset `text-transform`, `letter-spacing`, and caps-related styling on the transformed content area, while keeping plugin UI and the `EN/TP` locale switcher excluded. The underlying text should remain normal lowercase toki pona with spaces, e.g. `mani ala` and `o kama jo e lipu ilo`.

## 9) Deployment Verification (Runtime Fingerprints)

Use these checks on the real deployed `/tp` page to distinguish stale deployment/cache from integration bugs.

In browser console:

```js
document.querySelector('#sitelen-layer-toggle-mount .slp-toggle')?.className
```

Expected includes:

- `slp-toggle--size-lg`
- `slp-toggle--mounted`

```js
[...document.querySelectorAll('#sitelen-layer-toggle-mount .slp-toggle__btn')].map((b) =>
  b.textContent?.trim()
)
```

Expected:

- `["TP", "SP", "🙂"]`

Overlay expectations:

- `Toggle mode: inline`
- `Toggle size: lg`
- `Toggle mount: ...`
- `Container: main`

If fingerprints are missing, your production deployment most likely still serves an old JS/CSS bundle.
