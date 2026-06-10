import type { Action } from 'svelte/action';
import { createSitelenLayerPlugin } from './index';
import type { SitelenLayerPluginConfig } from './types';
import type { SitelenLayerPlugin } from './plugin';

export interface SitelenLayerActionOptions extends SitelenLayerPluginConfig {
  autoInit?: boolean;
}

export type SitelenLayerActionReturn = {
  update(config: SitelenLayerActionOptions): void;
  destroy: () => void;
};

export const sitelenLayerAction: Action<HTMLElement, SitelenLayerActionOptions> = (
  node: HTMLElement,
  initialOptions: SitelenLayerActionOptions = {}
) => {
  let plugin: SitelenLayerPlugin | null = null;

  const start = (options: SitelenLayerActionOptions = {}): void => {
    const autoInit = options.autoInit ?? true;
    if (!autoInit || typeof window === 'undefined') {
      return;
    }

    plugin?.destroy();
    plugin = createSitelenLayerPlugin({
      ...options,
      container: options.container ?? node
    });
    plugin.init();
  };

  const destroy = (): void => {
    plugin?.destroy();
    plugin = null;
  };

  start(initialOptions);

  return {
    update(config = {}) {
      destroy();
      start(config);
    },
    destroy
  };
};

export default sitelenLayerAction;
