// Vendored from @it-tools/bip39 v0.0.4 (MIT) — Copyright (c) Corentin THOMASSET.
// Original source: https://github.com/CorentinTh/it-tools-bip39
// Reimplemented in TS without the js-sha256 / nanoid runtime deps:
// SHA-256 comes from crypto-js (already a project dep) and random bytes
// from the Web Crypto API.

import sha256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';

export function validateEntropyLength(length: number): void {
  if (length < 16) {
    throw new Error('[bip39] Invalid entropy: the length of the entropy string should be >= 16');
  }
  if (length > 32) {
    throw new Error('[bip39] Invalid entropy: the length of the entropy string should be <= 32');
  }
  if (length % 4 !== 0) {
    throw new Error('[bip39] Invalid entropy: the length of the entropy string should be a multiple of 4');
  }
}

export function generateEntropy(length = 32): string {
  validateEntropyLength(length);
  const byteCount = Math.ceil(length / 2);
  const bytes = new Uint8Array(byteCount);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').slice(0, length);
}

export function getByteArrayFromHexString(hex: string): number[] {
  return (hex.match(/.{1,2}/g) ?? []).map(b => Number.parseInt(b, 16));
}

export function bytesToBinary(bytes: number[]): string {
  return bytes.reduce((acc, b) => acc + b.toString(2).padStart(8, '0'), '');
}

export function getIntegerFromBin(bin: string): number {
  return Number.parseInt(bin, 2);
}

export function getChecksumBin(bytes: number[]): string {
  const checksumBitLength = (8 * bytes.length) / 32;
  const hexInput = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = sha256(Hex.parse(hexInput)).toString(Hex);
  return bytesToBinary(getByteArrayFromHexString(hashHex)).slice(0, checksumBitLength);
}
