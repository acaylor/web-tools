import { describe, expect, it } from 'vitest';
import { figue } from './figue';

describe('figue', () => {
  it('returns the default values when no env/config is provided', () => {
    const config = figue({
      host: { format: 'string', default: 'localhost' },
      port: { format: 'integer', default: 8080 },
    })
      .getConfig();

    expect(config).toEqual({ host: 'localhost', port: 8080 });
  });

  it('supports nested schemas', () => {
    const config = figue({
      app: {
        name: { format: 'string', default: 'web-tools' },
        server: {
          port: { format: 'integer', default: 3000 },
        },
      },
    })
      .getConfig();

    expect(config).toEqual({ app: { name: 'web-tools', server: { port: 3000 } } });
  });

  it('reads values from env using the env key, taking precedence over config and default', () => {
    const config = figue({
      port: { format: 'integer', default: 8080, env: 'PORT' },
    })
      .loadEnv({ PORT: '4242' })
      .loadConfig({ port: 9999 })
      .getConfig();

    expect(config.port).toBe(4242);
  });

  it('falls back to config when env is absent', () => {
    const config = figue({
      port: { format: 'integer', default: 8080, env: 'PORT' },
    })
      .loadConfig({ port: 9999 })
      .getConfig();

    expect(config.port).toBe(9999);
  });

  describe('coercion', () => {
    it('coerces strings into integers, floats and booleans', () => {
      const config = figue({
        count: { format: 'integer', default: 0, env: 'COUNT' },
        ratio: { format: 'float', default: 0, env: 'RATIO' },
        enabled: { format: 'boolean', default: false, env: 'ENABLED' },
      })
        .loadEnv({ COUNT: '12', RATIO: '3.14', ENABLED: 'true' })
        .getConfig();

      expect(config).toEqual({ count: 12, ratio: 3.14, enabled: true });
    });

    it('coerces "false"/non-true strings to false for booleans', () => {
      const config = figue({
        enabled: { format: 'boolean', default: true, env: 'ENABLED' },
      })
        .loadEnv({ ENABLED: 'false' })
        .getConfig();

      expect(config.enabled).toBe(false);
    });

    it('coerces comma-separated strings into arrays and empty string into an empty array', () => {
      const config = figue({
        list: { format: 'array', default: [], env: 'LIST' },
        empty: { format: 'array', default: ['x'], env: 'EMPTY' },
      })
        .loadEnv({ LIST: 'a,b,c', EMPTY: '' })
        .getConfig();

      expect(config).toEqual({ list: ['a', 'b', 'c'], empty: [] });
    });
  });

  describe('validate', () => {
    it('does not throw when every value complies with its format', () => {
      const instance = figue({
        host: { format: 'string', default: 'localhost' },
        port: { format: 'integer', default: 8080 },
      });

      expect(() => instance.validate()).not.toThrow();
    });

    it('throws when a value does not comply with its format', () => {
      const instance = figue({
        port: { format: 'integer', default: 8080, env: 'PORT' },
      })
        .loadEnv({ PORT: 'not-a-number' });

      expect(() => instance.validate()).toThrow();
    });

    it('rejects enum values that are not part of the allowed list', () => {
      const instance = figue({
        level: { format: 'enum', values: ['debug', 'info'], default: 'info', env: 'LEVEL' },
      })
        .loadEnv({ LEVEL: 'verbose' });

      expect(() => instance.validate()).toThrow();
    });

    it('accepts enum values that are part of the allowed list', () => {
      const instance = figue({
        level: { format: 'enum', values: ['debug', 'info'], default: 'info', env: 'LEVEL' },
      })
        .loadEnv({ LEVEL: 'debug' });

      expect(() => instance.validate()).not.toThrow();
      expect(instance.getConfig().level).toBe('debug');
    });
  });

  describe('custom format', () => {
    it('uses the provided validate and coerce functions', () => {
      const instance = figue({
        upper: {
          format: 'custom',
          default: 'abc',
          env: 'UPPER',
          coerce: value => String(value).toUpperCase(),
          validate: value => typeof value === 'string',
        },
      })
        .loadEnv({ UPPER: 'hello' });

      expect(instance.getConfig().upper).toBe('HELLO');
      expect(() => instance.validate()).not.toThrow();
    });
  });
});
