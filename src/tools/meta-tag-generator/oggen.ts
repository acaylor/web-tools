// Vendored from @it-tools/oggen v1.3.0 (MIT) — Copyright (c) 2022 Corentin THOMASSET.
// Original source: https://github.com/CorentinTh/oggen

export type MetadataValue = boolean | string | Date | number;

export interface MetadataConfig {
  [key: string]: MetadataValue | MetadataValue[] | MetadataConfig;
}

interface MetadataFlat {
  key: string;
  value: string;
}

interface GenerateMetaOptions {
  indentation?: number;
  indentWith?: string;
  generateTwitterCompatibleMeta?: boolean;
}

const twitterCompatibility: Record<string, string> = {
  'og:description': 'twitter:description',
  'og:title': 'twitter:title',
  'og:image': 'twitter:image',
  'og:image:url': 'twitter:image',
  'og:image:alt': 'twitter:image:alt',
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date);
}

function toSnakeCaseSegment(s: string): string {
  return s.match(/[A-Z]{2,}(?=[A-Z][a-z]|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map(x => x.toLowerCase())
    .join('_') ?? '';
}

function toSnakeCase(s: string): string {
  return s.split(':').map(toSnakeCaseSegment).join(':');
}

function stringifyValue(value: MetadataValue): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

function flattenMetadata(
  metadata: MetadataConfig | MetadataValue | MetadataValue[] | undefined,
  { separator = ':', basePrefix = '' }: { separator?: string; basePrefix?: string } = {},
): MetadataFlat[] {
  const acc: MetadataFlat[] = [];

  const walk = (node: unknown, prefix = '') => {
    if (node === undefined || node === '') {
      return;
    }
    if (isPlainObject(node)) {
      for (const [key, value] of Object.entries(node)) {
        const prefixedKey = [prefix, toSnakeCase(key)].filter(Boolean).join(separator);
        walk(value, prefixedKey);
      }
    }
    else if (Array.isArray(node)) {
      for (const value of node) {
        walk(value, prefix);
      }
    }
    else {
      acc.push({ key: prefix, value: stringifyValue(node as MetadataValue) });
    }
  };

  walk(metadata, basePrefix);
  return acc;
}

function pickTwitterCompatibleMetadata(
  { existingMeta, twitterMeta }: { existingMeta: MetadataFlat[]; twitterMeta: MetadataFlat[] },
): MetadataFlat[] {
  return existingMeta
    .filter(({ key }) => key in twitterCompatibility
      && twitterMeta.find(tm => tm.key === twitterCompatibility[key]) === undefined)
    .map(({ key, value }) => ({ key: twitterCompatibility[key] ?? key, value }));
}

function metaToString({ flatMetadata: { key, value }, type }: { flatMetadata: MetadataFlat; type: string }): string {
  return `<meta ${type.trim()}="${key.trim()}" value="${value.trim()}" />`;
}

function buildMetaStrings({ flatMetadata, type }: { flatMetadata: MetadataFlat[]; type: string }): string[] {
  return flatMetadata.map(entry => metaToString({ flatMetadata: entry, type }));
}

function generateMetaForType(
  { title, flatMetadata, type }: { title: string; flatMetadata: MetadataFlat[]; type: string },
): string[] {
  if (flatMetadata.length === 0) {
    return [];
  }
  return [`<!-- ${title} -->`, ...buildMetaStrings({ flatMetadata, type })];
}

export function generateMeta(
  { twitter: twitterMetadataRaw, ...ogMetadataRaw }: MetadataConfig,
  { indentation = 0, indentWith = '  ', generateTwitterCompatibleMeta = false }: GenerateMetaOptions = {},
): string {
  const ogMetadataFlat = flattenMetadata(ogMetadataRaw as MetadataConfig, { basePrefix: 'og' });
  const twitterMetadataFlat = flattenMetadata(twitterMetadataRaw as MetadataConfig | undefined, { basePrefix: 'twitter' });

  const metaStringGroups = [
    generateMetaForType({
      title: 'og meta',
      flatMetadata: ogMetadataFlat,
      type: 'property',
    }),
    generateMetaForType({
      title: 'twitter meta',
      flatMetadata: [
        ...twitterMetadataFlat,
        ...(generateTwitterCompatibleMeta
          ? pickTwitterCompatibleMetadata({ existingMeta: ogMetadataFlat, twitterMeta: twitterMetadataFlat })
          : []),
      ],
      type: 'name',
    }),
  ];

  return metaStringGroups
    .filter(group => group && group.length > 0)
    .map(group => group.map(str => indentWith.repeat(indentation) + str).join('\n'))
    .join('\n\n');
}
