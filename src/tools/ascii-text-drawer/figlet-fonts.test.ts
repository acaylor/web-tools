import figlet from 'figlet';
import { describe, expect, it } from 'vitest';
import { DEFAULT_FONT, FontLoadError, fontNames, isFontLoaded, loadFont } from './figlet-fonts';

describe('figlet-fonts', () => {
  it('lists every installed font once, sorted, including the default', () => {
    expect(fontNames).toContain(DEFAULT_FONT);
    expect(fontNames).toContain('Banner3');
    expect(new Set(fontNames).size).toBe(fontNames.length);
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
