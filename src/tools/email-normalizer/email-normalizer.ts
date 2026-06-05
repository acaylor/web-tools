// Vendored from email-normalizer v1.0.0 (MIT) — Copyright (c) Corentin THOMASSET.
// Original source: https://github.com/CorentinTh/email-normalizer

interface DomainConfig {
  removeDots: boolean;
  stripPlus: boolean;
  renameDomain?: string;
}

const domainsConfig: Record<string, DomainConfig> = {
  'gmail.com': {
    removeDots: true,
    stripPlus: true,
  },
  'googlemail.com': {
    removeDots: true,
    stripPlus: true,
    renameDomain: 'gmail.com',
  },
  'hotmail.com': {
    removeDots: false,
    stripPlus: true,
  },
  'live.com': {
    removeDots: true,
    stripPlus: true,
  },
  'outlook.com': {
    removeDots: false,
    stripPlus: true,
  },
};

function isValidEmail({ email }: { email: unknown }): boolean {
  if (typeof email !== 'string') {
    return false;
  }
  return email.trim().match(/^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i) !== null;
}

function normalizeIdentifier(
  { identifier, removeDots, stripPlus }: { identifier: string; removeDots: boolean; stripPlus: boolean },
): string {
  let normalized = identifier;
  if (removeDots) {
    normalized = normalized.replace(/\./g, '');
  }
  if (stripPlus) {
    normalized = normalized.split('+')[0];
  }
  return normalized;
}

export function normalizeEmail({ email: rawEmail }: { email: string }): string {
  if (!isValidEmail({ email: rawEmail })) {
    throw new Error('Invalid email');
  }
  const normalizedEmail = rawEmail.trim().toLowerCase();
  const [identifier, domain] = normalizedEmail.split('@');
  const domainConfig = domainsConfig[domain];
  if (!domainConfig) {
    return normalizedEmail;
  }
  const normalizedIdentifier = normalizeIdentifier({
    identifier,
    removeDots: domainConfig.removeDots,
    stripPlus: domainConfig.stripPlus,
  });
  const normalizedDomain = domainConfig.renameDomain ?? domain;
  return `${normalizedIdentifier}@${normalizedDomain}`;
}

export type { DomainConfig };
