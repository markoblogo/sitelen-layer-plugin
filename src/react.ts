import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createSitelenLayerPlugin } from './index';
import type { SitelenLayerPluginConfig } from './types';
import type { SitelenLayerPlugin } from './plugin';

export interface UseSitelenLayerPluginOptions {
  autoInit?: boolean;
  enabled?: boolean;
}

export function useSitelenLayerPlugin(
  config: SitelenLayerPluginConfig = {},
  options: UseSitelenLayerPluginOptions = {}
): SitelenLayerPlugin | null {
  const pluginRef = useRef<SitelenLayerPlugin | null>(null);
  const enabled = options.enabled ?? true;
  const autoInit = options.autoInit ?? true;

  useEffect(() => {
    if (!enabled || !autoInit || typeof window === 'undefined') {
      return undefined;
    }

    const plugin = createSitelenLayerPlugin(config);
    pluginRef.current = plugin;
    plugin.init();

    return () => {
      plugin.destroy();
      pluginRef.current = null;
    };
  }, [config, enabled, autoInit]);

  return pluginRef.current;
}

export interface SitelenLayerProviderProps {
  config?: SitelenLayerPluginConfig;
  enabled?: boolean;
  autoInit?: boolean;
  children?: ReactNode;
}

export function SitelenLayerProvider({
  children,
  config,
  enabled = true,
  autoInit = true
}: SitelenLayerProviderProps): ReactNode {
  useSitelenLayerPlugin(config ?? {}, { enabled, autoInit });
  return children ?? null;
}

export default { useSitelenLayerPlugin, SitelenLayerProvider };
