import { describe, expect, it } from 'vitest';
import { createTokiPonaLocaleProfiles } from './presets';

describe('presets', () => {
  it('creates tp/non-tp profiles with expected defaults', () => {
    const profiles = createTokiPonaLocaleProfiles({ container: '#tp-content' });

    expect(profiles).toHaveLength(2);
    expect(profiles[0].id).toBe('tp-locale');
    expect(profiles[0].config.layers).toEqual(['latin', 'sitelen-pona', 'sitelen-emoji']);
    expect(profiles[0].config.threshold).toBe(0.7);

    expect(profiles[1].id).toBe('non-tp-locale');
    expect(profiles[1].config.showToggle).toBe(false);
    expect(profiles[1].config.layers).toEqual(['latin']);
  });

  it('respects custom route prefixes', () => {
    const profiles = createTokiPonaLocaleProfiles({
      container: '#tp-content',
      tpPathPrefix: '/tok',
      nonTpPathPrefix: '/eng'
    });

    expect(profiles[0].match?.pathnamePrefix).toBe('/tok');
    expect(profiles[1].match?.pathnamePrefix).toBe('/eng');
  });
});
