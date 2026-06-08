declare module '*.vue' {
  import type {  ComponentOptions } from 'vue';
  const Component: ComponentOptions;
  export default Component;
}

declare module '*.md' {
  import type {  ComponentOptions } from 'vue';
  const Component: ComponentOptions;
  export default Component;
}

declare module 'iarna-toml-esm' {
  export const parse: (toml: string) => any;
  export const stringify: (obj: any) => string;
}

declare module 'emojilib' {
  const lib: Record<string, string[]>;
  export default lib;
}

declare module 'unicode-emoji-json' {
  const emoji: Record<string, {
    name: string;
    slug: string;
    group: string;
    emoji_version: string;
    unicode_version: string;
    skin_tone_support: boolean;
    skin_tone_support_unicode_version: string;
  }>;
  
  export default emoji;
}

// We import monaco's core editor API from its deep ESM path to avoid bundling
// the language workers. monaco's `exports` map ("./*": "./*") has no extension,
// so TS can't resolve the .d.ts; the type surface is identical to the package
// entry, so re-export it.
declare module 'monaco-editor/esm/vs/editor/editor.api' {
  export * from 'monaco-editor';
}

declare module 'pdf-signature-reader' {
  const verifySignature: (pdf: ArrayBuffer) => ({signatures: SignatureInfo[]});

  export default verifySignature;
}