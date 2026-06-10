export interface SitelenLayerWebpackPluginOptions {
  autoInjectStyles?: boolean;
  autoInit?: boolean;
  initConfig?: Record<string, unknown>;
  scriptBody?: string;
}

const STYLE_ENTRY = 'sitelen-layer-plugin/styles.css';

function normalizeEntry(entry: unknown): unknown {
  if (typeof entry === 'string') {
    return [STYLE_ENTRY, entry];
  }

  if (Array.isArray(entry)) {
    if (!entry.includes(STYLE_ENTRY)) {
      entry.unshift(STYLE_ENTRY);
    }
    return entry;
  }

  if (entry && typeof entry === 'object') {
    const objectEntry = entry as Record<string, unknown>;
    Object.entries(objectEntry).forEach(([entryName, value]) => {
      if (typeof value === 'string') {
        objectEntry[entryName] = [STYLE_ENTRY, value];
      } else if (Array.isArray(value)) {
        if (!value.includes(STYLE_ENTRY)) {
          value.unshift(STYLE_ENTRY);
        }
      } else {
        normalizeEntry(value);
      }
    });
  }

  return entry;
}

function createInlineInitScript(options: SitelenLayerWebpackPluginOptions): string {
  if (options.scriptBody && options.scriptBody.length > 0) {
    return options.scriptBody;
  }

  const payload = JSON.stringify({
    ...(options.initConfig ?? {})
  });

  return `;(function() {\n  if (typeof window === 'undefined') return;\n  import('sitelen-layer-plugin').then(({ createSitelenLayerPlugin }) => {\n    createSitelenLayerPlugin(${payload}).init();\n  });\n})();`;
}

export class SitelenLayerWebpackPlugin {
  private readonly options: SitelenLayerWebpackPluginOptions;

  constructor(options: SitelenLayerWebpackPluginOptions = {}) {
    this.options = {
      autoInjectStyles: options.autoInjectStyles ?? true,
      autoInit: options.autoInit ?? false,
      initConfig: options.initConfig ?? {},
      scriptBody: options.scriptBody
    };
  }

  apply(compiler: any): void {
    if (!compiler || !compiler.options || typeof compiler.options !== 'object') {
      return;
    }

    if (this.options.autoInjectStyles) {
      compiler.options.entry = normalizeEntry(compiler.options.entry);
    }

    if (!this.options.autoInit) {
      return;
    }

    const inlineScript = createInlineInitScript(this.options);
    const scriptTag = `<script type="module">${inlineScript}</script>`;

    compiler.hooks.thisCompilation?.tap('SitelenLayerWebpackPlugin', (compilation: any) => {
      const htmlHook =
        compilation.hooks.htmlWebpackPluginBeforeEmit ??
        compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing ??
        compilation.hooks.htmlWebpackPluginAfterHtmlProcessing;

      htmlHook?.tapAsync?.('SitelenLayerWebpackPlugin', (data: { html: string }, cb: (err: Error | null, result?: unknown) => void) => {
        data.html = data.html.replace('</body>', `${scriptTag}</body>`);
        cb(null, data);
      });
      htmlHook?.tap?.('SitelenLayerWebpackPlugin', (data: { html: string }) => {
        data.html = data.html.replace('</body>', `${scriptTag}</body>`);
        return data;
      });
    });
  }
}

export default SitelenLayerWebpackPlugin;
