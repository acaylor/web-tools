declare module 'figue' {
  interface SchemaObjBase<T> {
    doc?: string
    default: T
    env?: string
  }

  interface SchemaObjFloat extends SchemaObjBase<number> {
    format: 'float'
  }

  interface SchemaObjInteger extends SchemaObjBase<number> {
    format: 'integer'
  }

  interface SchemaObjEnum extends SchemaObjBase<string> {
    format: 'enum'
    values: string[]
  }

  interface SchemaObjAny extends SchemaObjBase<unknown> {
    format: 'any'
  }

  interface SchemaObjString extends SchemaObjBase<string> {
    format: 'string'
  }

  interface SchemaObjBoolean extends SchemaObjBase<boolean> {
    format: 'boolean'
  }

  interface SchemaObjCustom extends SchemaObjBase<unknown> {
    format: 'custom'
    validate?: (value: unknown) => boolean
    coerce?: (value: unknown) => unknown
  }

  interface SchemaObjArray extends SchemaObjBase<string[]> {
    format: 'array'
  }

  type SchemaObj = SchemaObjInteger | SchemaObjEnum | SchemaObjFloat | SchemaObjAny | SchemaObjString | SchemaObjBoolean | SchemaObjCustom | SchemaObjArray;
  interface Schema {
    [k: string]: Schema | SchemaObj
  }
  interface Config {
    [k: string]: Config | unknown
  }
  type TypeFromSchema<T> = {
    [P in keyof T]: T[P] extends SchemaObj ? T[P]['default'] : TypeFromSchema<T[P]>
  };
  interface Env {
    [k: string]: number | string | boolean | undefined
  }

  class Figue<T extends Schema> {
    constructor(schema: T);
    loadEnv(env: Env): this;
    loadConfig(config: Config): this;
    validate(): this;
    getConfig(): TypeFromSchema<T>;
  }

  export { Figue, type Schema };
  export const figue: <T extends Schema>(schema: T) => Figue<T>;
}

declare module '@it-tools/oggen' {
  type MetadataValue = boolean | string | Date | number;
  interface MetadataConfig {
    [key: string]: MetadataValue | MetadataValue[] | MetadataConfig
  }

  export function generateMeta(metadata: MetadataConfig, options?: {
    indentation?: number
    indentWith?: string
    generateTwitterCompatibleMeta?: boolean
  }): string;
}
