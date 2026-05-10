import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

describe('package exports', () => {
  it('exposes bundled sitelen pona font CSS and assets', async () => {
    const packageJson = JSON.parse(await readFile(resolve(repoRoot, 'package.json'), 'utf8'));

    expect(packageJson.exports['./sitelen-pona-font.css']).toBe('./sitelen-pona-font.css');
    expect(packageJson.files).toContain('sitelen-pona-font.css');
    expect(packageJson.files).toContain('assets/fonts');

    expect(existsSync(resolve(repoRoot, 'sitelen-pona-font.css'))).toBe(true);
    expect(existsSync(resolve(repoRoot, 'assets/fonts/sitelen-seli-kiwen-asuki.ttf'))).toBe(true);
    expect(existsSync(resolve(repoRoot, 'assets/fonts/OFL-sitelen-seli-kiwen.txt'))).toBe(true);
    expect(existsSync(resolve(repoRoot, 'assets/fonts/README.md'))).toBe(true);
  });
});
