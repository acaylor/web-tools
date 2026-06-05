// Vendored from @it-tools/bip39 v0.0.4 (MIT) — Copyright (c) Corentin THOMASSET.
// Original source: https://github.com/CorentinTh/it-tools-bip39

import {
  bytesToBinary,
  generateEntropy,
  getByteArrayFromHexString,
  getChecksumBin,
  getIntegerFromBin,
  validateEntropyLength,
} from './common';
import { englishWordList } from './wordlists/english';
import type { WordList } from './wordlists/types';

export { generateEntropy };
export { englishWordList };
export { chineseSimplifiedWordList } from './wordlists/chinese-simplified';
export { chineseTraditionalWordList } from './wordlists/chinese-traditional';
export { czechWordList } from './wordlists/czech';
export { frenchWordList } from './wordlists/french';
export { italianWordList } from './wordlists/italian';
export { japaneseWordList } from './wordlists/japanese';
export { koreanWordList } from './wordlists/korean';
export { portugueseWordList } from './wordlists/portuguese';
export { spanishWordList } from './wordlists/spanish';
export type { WordList };

export function entropyToMnemonic(entropy: string, wordList: WordList = englishWordList): string {
  validateEntropyLength(entropy.length);
  if (!entropy.match(/^[a-fA-F0-9]+$/)) {
    throw new Error('[bip39] Invalid entropy: it should be a hexadecimal string');
  }
  const bytes = getByteArrayFromHexString(entropy);
  const bits = bytesToBinary(bytes) + getChecksumBin(bytes);
  const groups = bits.match(/.{1,11}/g) ?? [];
  return groups.map(g => wordList.words[getIntegerFromBin(g)]).join(wordList.spacer);
}

export function mnemonicToEntropy(mnemonic: string, wordList: WordList = englishWordList): string {
  const bits = mnemonic
    .trim()
    .split(wordList.spacer)
    .filter(Boolean)
    .map((word) => {
      const index = wordList.words.indexOf(word);
      if (index === -1) {
        throw new Error(`[bip39] Invalid mnemonic: word '${word}' not in the ${wordList.language} word list`);
      }
      return index.toString(2).padStart(11, '0');
    })
    .join('');

  const entropyBitLength = 32 * Math.floor(bits.length / 33);
  const entropyBits = bits.slice(0, entropyBitLength);
  const checksumBits = bits.slice(entropyBitLength);

  const bytes = (entropyBits.match(/.{1,8}/g) ?? []).map(b => getIntegerFromBin(b));

  if (getChecksumBin(bytes) !== checksumBits) {
    throw new Error('[bip39] Invalid checksum.');
  }

  return bytes.map(b => (b & 0xFF).toString(16).padStart(2, '0')).join('');
}
