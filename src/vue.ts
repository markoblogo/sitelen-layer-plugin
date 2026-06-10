import type { ObjectDirective, Ref } from 'vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createSitelenLayerPlugin } from './index';
import type { SitelenLayerPluginConfig } from './types';

interface SitelenLayerLifecycle {
  destroy(): void;
}

export type SitelenLayerPluginRef = Ref<SitelenLayerLifecycle | null>;

const STORAGE_KEY = '__sitelenLayerPlugin';
const DEFAULT_SELECTOR = 'body';

export function useSitelenLayerPlugin(config: SitelenLayerPluginConfig = {}): SitelenLayerPluginRef {
  const pluginRef = ref<SitelenLayerLifecycle | null>(null);

  onMounted(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const plugin = createSitelenLayerPlugin(config);
    pluginRef.value = plugin;
    plugin.init();
  });

  onBeforeUnmount(() => {
    pluginRef.value?.destroy();
    pluginRef.value = null;
  });

  return pluginRef;
}

export interface SitelenLayerDirectiveConfig extends SitelenLayerPluginConfig {
  autoStart?: boolean;
}

export function createSitelenLayerDirective(
  baseConfig: SitelenLayerPluginConfig = {}
): ObjectDirective<Element, SitelenLayerDirectiveConfig> {
  return {
    mounted(el, binding) {
      if (typeof window === 'undefined') {
        return;
      }

      const value = (binding?.value ?? {}) as SitelenLayerDirectiveConfig;
      if (value.autoStart === false) {
        return;
      }

      const plugin = createSitelenLayerPlugin({
        ...baseConfig,
        ...value,
        container: value.container ?? el,
        storageKey: value.storageKey ?? `${STORAGE_KEY}:${binding?.arg ?? DEFAULT_SELECTOR}`
      });

      plugin.init();
      (el as Element & { __sitelenLayerPlugin?: SitelenLayerLifecycle }).__sitelenLayerPlugin = plugin;
    },
    beforeUnmount(el) {
      const plugin = (el as Element & { __sitelenLayerPlugin?: SitelenLayerLifecycle }).__sitelenLayerPlugin;
      plugin?.destroy();
      delete (el as Element & { __sitelenLayerPlugin?: SitelenLayerLifecycle }).__sitelenLayerPlugin;
    },
    unmounted(el) {
      const plugin = (el as Element & { __sitelenLayerPlugin?: SitelenLayerLifecycle }).__sitelenLayerPlugin;
      plugin?.destroy();
      delete (el as Element & { __sitelenLayerPlugin?: SitelenLayerLifecycle }).__sitelenLayerPlugin;
    }
  };
}

export const vSitelenLayer = createSitelenLayerDirective();

export default { useSitelenLayerPlugin, createSitelenLayerDirective, vSitelenLayer };
