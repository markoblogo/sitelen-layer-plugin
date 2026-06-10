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

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
};

function shouldRunOnRoute(url) {
  const pathname = String(url || '').toLowerCase();
  const hasInclude = ROUTE_INCLUDE.length > 0;
  const isIncluded = hasInclude ? ROUTE_INCLUDE.some((needle) => pathname.includes(String(needle).toLowerCase())) : true;
  const isExcluded = toArray(ROUTE_EXCLUDE).some((needle) => pathname.includes(String(needle).toLowerCase()));
  return isIncluded && !isExcluded;
}

if (typeof window !== 'undefined' && shouldRunOnRoute(window.location.pathname)) {
  chrome?.runtime?.sendMessage({ type: 'GET_ENABLED' }, (response) => {
    const enabled = response?.enabled !== false;
    if (!enabled) {
      return;
    }

    const moduleUrl = chrome.runtime.getURL('sitelen-layer-plugin.bundle.js');

    import(moduleUrl)
      .then(({ createSitelenLayerPlugin }) => {
        const plugin = createSitelenLayerPlugin(DEFAULT_CONFIG);
        plugin.init();
        window.__sitelenLayerPlugin__ = plugin;
      })
      .catch((error) => {
        console.error('[sitelen-layer] extension bootstrap failed', error);
      });
  });
}
