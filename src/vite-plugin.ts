import type { HtmlTagDescriptor, Plugin } from 'vite';
import type { SitelenLayerPluginConfig } from './types';

export interface SitelenLayerVitePluginOptions {
  autoImportStyle?: boolean;
  autoInit?: boolean;
  container?: string;
  initConfig?: SitelenLayerPluginConfig;
  styleHref?: string;
  scriptBody?: string;
  injectInto?: 'head' | 'body';
}

const DEFAULT_STYLE_HREF = 'sitelen-layer-plugin/styles.css';

function createInitCode(options: SitelenLayerVitePluginOptions): string {
  const initConfig = {
    ...(options.initConfig ?? {}),
    ...(options.container ? { container: options.container } : {})
  };

  const configJson = JSON.stringify(initConfig);
  return `import { createSitelenLayerPlugin } from 'sitelen-layer-plugin';\ncreateSitelenLayerPlugin(${configJson}).init();`;
}

export function sitelenLayerVitePlugin(options: SitelenLayerVitePluginOptions = {}): Plugin {
  const normalized: Required<SitelenLayerVitePluginOptions> = {
    autoImportStyle: options.autoImportStyle ?? true,
    autoInit: options.autoInit ?? false,
    container: options.container ?? '',
    initConfig: options.initConfig ?? {},
    styleHref: options.styleHref ?? DEFAULT_STYLE_HREF,
    scriptBody: options.scriptBody ?? '',
    injectInto: options.injectInto ?? 'head'
  };

  return {
    name: 'sitelen-layer-plugin',
    apply: 'build',
    transformIndexHtml: (html: string): { html: string; tags: HtmlTagDescriptor[] } => {
      const tags: HtmlTagDescriptor[] = [];

      if (normalized.autoImportStyle) {
        tags.push({
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: normalized.styleHref
          },
          injectTo: 'head'
        });
      }

      if (normalized.autoInit) {
        const body = normalized.scriptBody || createInitCode(normalized);
        tags.push({
          tag: 'script',
          attrs: {
            type: 'module'
          },
          children: body,
          injectTo: normalized.injectInto
        });
      }

      return { html, tags };
    }
  };
}

export default sitelenLayerVitePlugin;
