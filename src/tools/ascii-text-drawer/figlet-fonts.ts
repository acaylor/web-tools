import figlet from 'figlet';
import standardFont from 'figlet/fonts/Standard';

// Fonts are served from the installed figlet package instead of a third-party
// CDN (see #39). Standard ships with the tool so the default output needs no
// extra request; every other font is its own lazy chunk, fetched on first use.
export const DEFAULT_FONT = 'Standard';

const fontImporters = import.meta.glob<string>(
  ['/node_modules/figlet/importable-fonts/*.js', '!/node_modules/figlet/importable-fonts/Standard.js'],
  { import: 'default' },
);

const lazyFonts = new Map(
  Object.entries(fontImporters).map(([path, importer]) => [path.slice(path.lastIndexOf('/') + 1, -'.js'.length), importer]),
);

export const fontNames = [DEFAULT_FONT, ...lazyFonts.keys()].sort((a, b) => a.localeCompare(b));

// Never let figlet fall back to fetching a font over the network.
figlet.defaults({ fetchFontIfMissing: false });
figlet.parseFont(DEFAULT_FONT, standardFont);

const loadedFonts = new Set([DEFAULT_FONT]);
const pendingFonts = new Map<string, Promise<void>>();

export class FontLoadError extends Error {}

export function isFontLoaded(name: string) {
  return loadedFonts.has(name);
}

export function loadFont(name: string): Promise<void> {
  if (loadedFonts.has(name)) {
    return Promise.resolve();
  }

  const importer = lazyFonts.get(name);
  if (!importer) {
    return Promise.reject(new Error(`Unknown font: ${name}`));
  }

  let pending = pendingFonts.get(name);
  if (!pending) {
    pending = importer()
      .then((data) => {
        figlet.parseFont(name, data);
        loadedFonts.add(name);
      }, (cause) => {
        throw new FontLoadError(`Could not download font: ${name}`, { cause });
      })
      .finally(() => pendingFonts.delete(name));
    pendingFonts.set(name, pending);
  }

  return pending;
}
