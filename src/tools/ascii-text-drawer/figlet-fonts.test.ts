import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import figlet from 'figlet';
import { describe, expect, it } from 'vitest';
import { DEFAULT_FONT, FontLoadError, fontNames, isFontLoaded, loadFont } from './figlet-fonts';

function listInstalledFonts() {
  const fontsDir = dirname(createRequire(import.meta.url).resolve('figlet/fonts/Standard'));

  return readdirSync(fontsDir)
    .filter(file => file.endsWith('.js'))
    .map(file => file.slice(0, -'.js'.length));
}

describe('figlet-fonts', () => {
  it('lists exactly the fonts installed with figlet, once each, sorted', () => {
    const installedFonts = listInstalledFonts();

    expect(installedFonts.length).toBeGreaterThan(300);
    expect([...fontNames].sort()).toEqual(installedFonts.sort());
    expect(fontNames).toEqual([...fontNames].sort((a, b) => a.localeCompare(b)));
  });

  it('has the default font registered without loading anything', () => {
    expect(isFontLoaded(DEFAULT_FONT)).toBe(true);
    expect(figlet.textSync('Hi', { font: DEFAULT_FONT })).toContain('_   _');
  });

  it('loads a lazy font on demand and registers it with figlet', async () => {
    expect(isFontLoaded('Slant')).toBe(false);

    await loadFont('Slant');

    expect(isFontLoaded('Slant')).toBe(true);
    expect(figlet.textSync('Hi', { font: 'Slant' })).toContain('/ /_/ /');
  });

  it('rejects unknown fonts without treating them as download failures', async () => {
    await expect(loadFont('Not A Font')).rejects.toThrow('Unknown font: Not A Font');
    await expect(loadFont('Not A Font')).rejects.not.toBeInstanceOf(FontLoadError);
  });
});
