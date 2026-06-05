import { describe, expect, it } from 'vitest';
import {
  englishWordList,
  entropyToMnemonic,
  frenchWordList,
  generateEntropy,
  japaneseWordList,
  mnemonicToEntropy,
} from './index';

// Canonical BIP-39 128-bit English test vectors
// (https://github.com/trezor/python-mnemonic/blob/master/vectors.json).
const englishVectors: [string, string][] = [
  ['00000000000000000000000000000000', 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'],
  ['7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f', 'legal winner thank year wave sausage worth useful legal winner thank yellow'],
  ['80808080808080808080808080808080', 'letter advice cage absurd amount doctor acoustic avoid letter advice cage above'],
  ['ffffffffffffffffffffffffffffffff', 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong'],
];

describe('bip39', () => {
  describe('entropyToMnemonic', () => {
    it('produces the expected mnemonic for the canonical english vectors', () => {
      for (const [entropy, mnemonic] of englishVectors) {
        expect(entropyToMnemonic(entropy)).toBe(mnemonic);
      }
    });

    it('accepts uppercase hexadecimal entropy', () => {
      expect(entropyToMnemonic('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toBe(
        'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong',
      );
    });

    it('throws on non-hexadecimal entropy', () => {
      expect(() => entropyToMnemonic('zz000000000000000000000000000000')).toThrow();
    });

    it('throws on entropy with an invalid length', () => {
      expect(() => entropyToMnemonic('00')).toThrow();
      expect(() => entropyToMnemonic('000000')).toThrow(); // not a multiple of 4
    });
  });

  describe('mnemonicToEntropy', () => {
    it('recovers the entropy from the canonical english vectors', () => {
      for (const [entropy, mnemonic] of englishVectors) {
        expect(mnemonicToEntropy(mnemonic)).toBe(entropy);
      }
    });

    it('throws when a word is not part of the word list', () => {
      expect(() => mnemonicToEntropy('abandon abandon notaword')).toThrow();
    });

    it('throws when the checksum is invalid', () => {
      // Valid words but a tampered last word breaks the checksum.
      const broken = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon';
      expect(() => mnemonicToEntropy(broken)).toThrow('Invalid checksum');
    });
  });

  describe('round trip', () => {
    it('round-trips generated entropy through english', () => {
      const entropy = generateEntropy();
      expect(mnemonicToEntropy(entropyToMnemonic(entropy))).toBe(entropy);
    });

    it('round-trips through a latin-script language with a space spacer (french)', () => {
      const entropy = generateEntropy();
      const mnemonic = entropyToMnemonic(entropy, frenchWordList);
      expect(mnemonicToEntropy(mnemonic, frenchWordList)).toBe(entropy);
    });

    it('round-trips through japanese using its ideographic-space spacer', () => {
      const entropy = generateEntropy();
      const mnemonic = entropyToMnemonic(entropy, japaneseWordList);
      expect(mnemonic).toContain(japaneseWordList.spacer);
      expect(mnemonicToEntropy(mnemonic, japaneseWordList)).toBe(entropy);
    });
  });

  describe('generateEntropy', () => {
    it('generates a lowercase hex string of the requested length', () => {
      const entropy = generateEntropy(32);
      expect(entropy).toMatch(/^[a-f0-9]{32}$/);
    });

    it('defaults to 32 hex characters (128 bits)', () => {
      expect(generateEntropy()).toHaveLength(32);
    });

    it('throws for an invalid requested length', () => {
      expect(() => generateEntropy(10)).toThrow();
    });
  });

  describe('word lists', () => {
    it('each shipped word list contains exactly 2048 words', () => {
      for (const wordList of [englishWordList, frenchWordList, japaneseWordList]) {
        expect(wordList.words).toHaveLength(2048);
      }
    });
  });
});
