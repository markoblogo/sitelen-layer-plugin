import type { EmojiEntry, NormalizedEmojiMapping } from './normalizeEmojiMapping';

// Small project-local additions layered over the upstream sitelen-emoji-truth snapshot.
// Keep this list conservative: names and services should normally remain latin fallback.
export const LOCAL_EMOJI_MAPPING_OVERRIDES: EmojiEntry[] = [
  { token: 'kin', output: '➕' },
  { token: 'lasina', output: '🔤' },
  { token: 'seto', output: '🏛️' },
  { token: 'sonko', output: '🇨🇳' }
];

export function applyLocalEmojiOverrides(
  mapping: NormalizedEmojiMapping
): NormalizedEmojiMapping {
  const entriesByToken = new Map(mapping.entries.map((entry) => [entry.token, entry]));
  const wordMap = { ...mapping.wordMap };

  LOCAL_EMOJI_MAPPING_OVERRIDES.forEach((override) => {
    const token = override.token.toLowerCase();
    const entry = { ...override, token };
    entriesByToken.set(token, entry);
    wordMap[token] = override.output;
  });

  return {
    ...mapping,
    entries: Array.from(entriesByToken.values()).sort((a, b) => a.token.localeCompare(b.token)),
    wordMap,
    metadata: {
      ...mapping.metadata,
      source: `${mapping.metadata.source}+local-overrides`
    }
  };
}
