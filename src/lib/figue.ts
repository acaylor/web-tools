// Vendored from figue v1.2.0 (MIT) — Copyright (c) 2022 Corentin THOMASSET.
// Original source: https://github.com/CorentinTh/figue

import _ from 'lodash';

interface SchemaObjBase<T> {
  doc?: string;
  default: T;
  env?: string;
}

interface SchemaObjFloat extends SchemaObjBase<number> { format: 'float' }
interface SchemaObjInteger extends SchemaObjBase<number> { format: 'integer' }
interface SchemaObjEnum extends SchemaObjBase<string> { format: 'enum'; values: string[] }
interface SchemaObjAny extends SchemaObjBase<unknown> { format: 'any' }
interface SchemaObjString extends SchemaObjBase<string> { format: 'string' }
interface SchemaObjBoolean extends SchemaObjBase<boolean> { format: 'boolean' }
interface SchemaObjCustom extends SchemaObjBase<unknown> {
  format: 'custom';
  validate?: (value: unknown) => boolean;
  coerce?: (value: unknown) => unknown;
}
interface SchemaObjArray extends SchemaObjBase<string[]> { format: 'array' }

type SchemaObj =
  | SchemaObjInteger
  | SchemaObjEnum
  | SchemaObjFloat
  | SchemaObjAny
  | SchemaObjString
  | SchemaObjBoolean
  | SchemaObjCustom
  | SchemaObjArray;

export interface Schema { [k: string]: Schema | SchemaObj }
interface Config { [k: string]: Config | unknown }
type TypeFromSchema<T> = {
  [P in keyof T]: T[P] extends SchemaObj ? T[P]['default'] : TypeFromSchema<T[P]>
};
interface Env { [k: string]: number | string | boolean | undefined }

interface Format {
  validate: (value: unknown, schema: SchemaObj) => boolean;
  coerce: (value: unknown, schema: SchemaObj) => unknown;
}

const formats: Record<SchemaObj['format'], Format> = {
  float: {
    validate: value => _.isNumber(value) && !_.isNaN(value) && _.isFinite(value),
    coerce: value => (_.isString(value) ? Number.parseFloat(value) : value),
  },
  integer: {
    validate: value => _.isInteger(value),
    coerce: value => (_.isString(value) ? Number.parseInt(value) : value),
  },
  enum: {
    validate: (value, schema) => _.isString(value) && (schema as SchemaObjEnum).values.includes(value),
    coerce: value => String(value),
  },
  any: {
    validate: () => true,
    coerce: value => value,
  },
  string: {
    validate: value => _.isString(value),
    coerce: value => String(value),
  },
  boolean: {
    validate: () => true,
    coerce: value => (_.isString(value) ? value.trim().toLowerCase() === 'true' : Boolean(value)),
  },
  custom: {
    validate: (value, schema) => (schema as SchemaObjCustom).validate?.(value) ?? true,
    coerce: (value, schema) => (schema as SchemaObjCustom).coerce?.(value) ?? value,
  },
  array: {
    validate: value => _.isArray(value) && value.every(item => _.isString(item)),
    coerce: (value) => {
      if (!_.isString(value)) {
        return value;
      }
      if (value === '') {
        return [];
      }
      return value.split(',');
    },
  },
};

function isFalsyOrHasThrown(cb: () => unknown): boolean {
  try {
    return !cb();
  }
  catch {
    return true;
  }
}

interface FlatEntry {
  path: string[];
  schema: SchemaObj;
}

function flattenSchema(schema: Schema, keys: string[] = []): FlatEntry[] {
  const acc: FlatEntry[] = [];
  for (const [key, value] of Object.entries(schema)) {
    const valueHasFormat = Object.entries(value).some(([k, v]) => k === 'format' && _.isString(v));
    const path = [...keys, key];
    if (_.isObject(value) && !valueHasFormat) {
      acc.push(...flattenSchema(value as Schema, path));
    }
    else {
      acc.push({ path, schema: value as SchemaObj });
    }
  }
  return acc;
}

export class Figue<T extends Schema> {
  private readonly schemaFlat: FlatEntry[];
  private env: Env = {};
  private config: Config = {};

  constructor(schema: T) {
    this.schemaFlat = flattenSchema(schema);
  }

  loadEnv(env: Env): this {
    this.env = _.merge(this.env, env);
    return this;
  }

  loadConfig(config: Config): this {
    this.config = _.merge(this.config, config);
    return this;
  }

  validate(): this {
    const configValues = this.getConfig();
    const errors: string[] = [];
    for (const { path, schema } of this.schemaFlat) {
      const format = formats[schema.format];
      if (!format) {
        throw new Error(`[figue:invalid-format] The format '${schema.format}' does not exist, valid formats are ${Object.keys(formats).join(', ')}.`);
      }
      const value = _.get(configValues, path);
      if (isFalsyOrHasThrown(() => format.validate(value, schema))) {
        errors.push(`[figue:validation-error] The key '${path}' does not comply with the format '${schema.format}', received value ${JSON.stringify(value)}`);
      }
    }
    if (errors.length > 0) {
      throw new TypeError(errors.join('\n'));
    }
    return this;
  }

  private getValue({ path, schema }: FlatEntry): unknown {
    const format = formats[schema.format];
    if (!format) {
      throw new Error(`[figue:invalid-format] The format '${schema.format}' does not exist, valid formats are ${Object.keys(formats).join(', ')}.`);
    }
    const envKey = schema.env;
    const value = (envKey !== undefined ? this.env[envKey] : undefined) ?? _.get(this.config, path) ?? schema.default;
    return format.coerce(value, schema) ?? value;
  }

  getConfig(): TypeFromSchema<T> {
    return this.schemaFlat.reduce<TypeFromSchema<T>>((acc, entry) => {
      _.set(acc as object, entry.path, this.getValue(entry));
      return acc;
    }, {} as TypeFromSchema<T>);
  }
}

export const figue = <T extends Schema>(schema: T): Figue<T> => new Figue(schema);
