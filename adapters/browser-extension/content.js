const DEFAULT_CONFIG = {
  container: 'body',
  toggleMode: 'floating',
  defaultLayer: 'latin',
  sitelenPona: {
    renderStrategy: 'ligature-font'
  },
  toggleMount: '#sitelen-layer-toggle'
};

const ROUTE_INCLUDE = ['/tp', '/toki-pona', '/nimi'];
const ROUTE_EXCLUDE = ['/admin', '/api/', '/login'];
const ROUTE_MATCH_MODE = 'contains';

const GLOBAL_PLUGIN_KEY = '__sitelenLayerPlugin__';

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
}

function matchRoute(route, rules) {
  if (!rules.length) {
    return true;
  }

  const normalized = String(route || '').toLowerCase();

  if (ROUTE_MATCH_MODE === 'exact') {
    return rules.some((value) => normalized === String(value).toLowerCase());
  }

  if (ROUTE_MATCH_MODE === 'startsWith') {
    return rules.some((value) => normalized.startsWith(String(value).toLowerCase()));
  }

  if (ROUTE_MATCH_MODE === 'regex') {
    return rules.some((value) => {
      try {
        const match = String(value).match(/^\/(.*)\/(.*)$/);
        const expression = match ? match[1] : String(value);
        const flags = match ? match[2] : 'i';
        return new RegExp(expression, flags).test(normalized);
      } catch (_error) {
        return false;
      }
    });
  }

  return rules.some((value) => normalized.includes(String(value).toLowerCase()));
}

function shouldRunOnRoute(url) {
  const pathname = String(url || '').toLowerCase();
  const includeOk = ROUTE_INCLUDE.length === 0 || matchRoute(pathname, ROUTE_INCLUDE);
  const excludeHit = matchRoute(pathname, ROUTE_EXCLUDE);
  return includeOk && !excludeHit;
}

function bootstrap() {
  const globalWindow = /** @type {Window & { [key: string]: unknown } | undefined} */ (window);

  if (!globalWindow?.chrome?.runtime) {
    return;
  }

  if (globalWindow[GLOBAL_PLUGIN_KEY]) {
    return;
  }

  globalWindow[GLOBAL_PLUGIN_KEY] = {
    status: 'bootstrapping'
  };

  globalWindow.chrome.runtime.sendMessage({ type: 'GET_ENABLED' }, (response) => {
    const enabled = response?.enabled !== false;
    if (!enabled) {
      globalWindow[GLOBAL_PLUGIN_KEY] = null;
      return;
    }

    const moduleUrl = globalWindow.chrome.runtime.getURL('sitelen-layer-plugin.bundle.js');

    import(moduleUrl)
      .then(({ createSitelenLayerPlugin }) => {
        const plugin = createSitelenLayerPlugin(DEFAULT_CONFIG);
        plugin.init();
        globalWindow[GLOBAL_PLUGIN_KEY] = plugin;
      })
      .catch((error) => {
        globalWindow[GLOBAL_PLUGIN_KEY] = null;
        console.error('[sitelen-layer] extension bootstrap failed', error);
      });
  });
}

if (typeof window !== 'undefined' && shouldRunOnRoute(window.location.pathname)) {
  bootstrap();
}
