import { describe, expect, it } from 'vitest';
import { normalizeEmail } from './email-normalizer';

describe('email-normalizer', () => {
  it('removes dots and strips the plus tag for gmail addresses', () => {
    expect(normalizeEmail({ email: 'john.doe+newsletter@gmail.com' })).toBe('johndoe@gmail.com');
  });

  it('renames googlemail.com to gmail.com', () => {
    expect(normalizeEmail({ email: 'john.doe+spam@googlemail.com' })).toBe('johndoe@gmail.com');
  });

  it('strips the plus tag but keeps dots for outlook and hotmail', () => {
    expect(normalizeEmail({ email: 'john.doe+tag@outlook.com' })).toBe('john.doe@outlook.com');
    expect(normalizeEmail({ email: 'john.doe+tag@hotmail.com' })).toBe('john.doe@hotmail.com');
  });

  it('removes dots and strips the plus tag for live.com', () => {
    expect(normalizeEmail({ email: 'john.doe+tag@live.com' })).toBe('johndoe@live.com');
  });

  it('lowercases and trims but leaves unknown domains otherwise untouched', () => {
    expect(normalizeEmail({ email: '  John.Doe+Tag@Example.COM  ' })).toBe('john.doe+tag@example.com');
  });

  it('applies dot removal before plus stripping', () => {
    expect(normalizeEmail({ email: 'a.b+c.d@gmail.com' })).toBe('ab@gmail.com');
  });

  it('throws on invalid email addresses', () => {
    expect(() => normalizeEmail({ email: 'not-an-email' })).toThrow('Invalid email');
    expect(() => normalizeEmail({ email: 'missing@domain' })).toThrow('Invalid email');
    expect(() => normalizeEmail({ email: '' })).toThrow('Invalid email');
  });
});
