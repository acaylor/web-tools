import { describe, expect, it } from 'vitest';
import { generateMeta } from './oggen';

describe('oggen', () => {
  it('generates og meta tags prefixed with og: and a property attribute', () => {
    const result = generateMeta({ title: 'Hello', description: 'World' });

    expect(result).toBe(
      [
        '<!-- og meta -->',
        '<meta property="og:title" value="Hello" />',
        '<meta property="og:description" value="World" />',
      ].join('\n'),
    );
  });

  it('generates twitter meta tags prefixed with twitter: and a name attribute', () => {
    const result = generateMeta({ twitter: { card: 'summary' } });

    expect(result).toBe(
      [
        '<!-- twitter meta -->',
        '<meta name="twitter:card" value="summary" />',
      ].join('\n'),
    );
  });

  it('converts camelCase keys to snake_case', () => {
    const result = generateMeta({ siteName: 'web-tools' });

    expect(result).toContain('<meta property="og:site_name" value="web-tools" />');
  });

  it('skips empty string values', () => {
    const result = generateMeta({ title: 'Hello', description: '' });

    expect(result).not.toContain('og:description');
    expect(result).toContain('og:title');
  });

  it('serializes Date values to ISO strings', () => {
    const date = new Date('2022-01-02T03:04:05.000Z');
    const result = generateMeta({ updatedTime: date });

    expect(result).toContain('value="2022-01-02T03:04:05.000Z"');
  });

  it('expands nested objects into colon-separated keys', () => {
    const result = generateMeta({ image: { url: 'http://example.com/a.png', alt: 'alt text' } });

    expect(result).toContain('<meta property="og:image:url" value="http://example.com/a.png" />');
    expect(result).toContain('<meta property="og:image:alt" value="alt text" />');
  });

  it('emits one tag per item for array values', () => {
    const result = generateMeta({ image: ['a.png', 'b.png'] });

    expect(result).toContain('<meta property="og:image" value="a.png" />');
    expect(result).toContain('<meta property="og:image" value="b.png" />');
  });

  it('derives twitter tags from og tags when generateTwitterCompatibleMeta is enabled', () => {
    const result = generateMeta(
      { title: 'Hello', description: 'World' },
      { generateTwitterCompatibleMeta: true },
    );

    expect(result).toContain('<meta name="twitter:title" value="Hello" />');
    expect(result).toContain('<meta name="twitter:description" value="World" />');
  });

  it('does not override an explicit twitter tag with the og-derived one', () => {
    const result = generateMeta(
      { title: 'Hello', twitter: { title: 'Custom' } },
      { generateTwitterCompatibleMeta: true },
    );

    expect(result).toContain('<meta name="twitter:title" value="Custom" />');
    expect(result).not.toContain('<meta name="twitter:title" value="Hello" />');
  });

  it('indents each line according to the indentation options', () => {
    const result = generateMeta({ title: 'Hello' }, { indentation: 1, indentWith: '  ' });

    for (const line of result.split('\n')) {
      expect(line.startsWith('  ')).toBe(true);
    }
  });
});
