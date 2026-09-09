/**
 * Carga los casos dorados del motor desde `fixtures/estimation-model/`, en la
 * raíz del repo. El archivo es el mismo que lee la suite de C#: si este loader
 * apunta a otro lado, las dos implementaciones dejan de estar atadas.
 *
 * Trae además un validador del subconjunto de JSON Schema que usa el esquema
 * de los casos. Se escribe acá en vez de traer una dependencia nueva: el
 * subconjunto es chico y el archivo que valida es de este repo.
 */
import fs from "fs";
import path from "path";

/** Sube desde el cwd hasta el directorio que contiene `fixtures/`. */
function repoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "fixtures", "estimation-model"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    `No encontré fixtures/estimation-model subiendo desde ${process.cwd()}`
  );
}

export const fixturesDir = () =>
  path.join(repoRoot(), "fixtures", "estimation-model");

const readJson = (file: string) =>
  JSON.parse(fs.readFileSync(path.join(fixturesDir(), file), "utf8"));

export const loadGoldenCases = () => readJson("casos-dorados.json");
export const loadGoldenSchema = () => readJson("casos-dorados.schema.json");

type Json = unknown;
type Schema = Record<string, unknown>;

const typeOf = (value: Json): string => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value as number)) return "integer";
  return typeof value;
};

const typeMatches = (value: Json, expected: string): boolean =>
  expected === "number"
    ? typeof value === "number"
    : expected === "integer"
      ? Number.isInteger(value)
      : typeOf(value) === expected;

/**
 * Valida `value` contra `schema`, devolviendo la lista de problemas. Cubre lo
 * que el esquema de los casos usa: `$ref`, `allOf`, `type`, `enum`, `required`,
 * `properties`, `additionalProperties` (booleano o esquema), `items`,
 * `minItems`, `minLength`, `minimum`, `maximum`, `exclusiveMinimum`,
 * `minProperties` y `maxProperties`. Lo que no cubre, lo ignora — por eso el
 * test que lo usa comprueba primero que el esquema no traiga palabras nuevas.
 */
export function validateAgainstSchema(
  value: Json,
  schema: Schema,
  root: Schema = schema,
  at = "$"
): string[] {
  const problems: string[] = [];

  if (typeof schema.$ref === "string") {
    return validateAgainstSchema(value, resolveRef(root, schema.$ref), root, at);
  }

  if (Array.isArray(schema.allOf)) {
    for (const sub of schema.allOf as Schema[]) {
      problems.push(...validateAgainstSchema(value, sub, root, at));
    }
  }

  if (schema.type !== undefined) {
    const expected = Array.isArray(schema.type)
      ? (schema.type as string[])
      : [schema.type as string];
    if (!expected.some((t) => typeMatches(value, t))) {
      problems.push(`${at}: esperaba ${expected.join(" | ")}, llegó ${typeOf(value)}`);
      return problems;
    }
  }

  if (Array.isArray(schema.enum) && !schema.enum.includes(value as never)) {
    problems.push(`${at}: "${String(value)}" no está en el enum`);
  }

  if (typeof value === "number") {
    const { minimum, maximum, exclusiveMinimum } = schema as Record<string, number>;
    if (minimum !== undefined && value < minimum) {
      problems.push(`${at}: ${value} < mínimo ${minimum}`);
    }
    if (maximum !== undefined && value > maximum) {
      problems.push(`${at}: ${value} > máximo ${maximum}`);
    }
    if (exclusiveMinimum !== undefined && value <= exclusiveMinimum) {
      problems.push(`${at}: ${value} debe superar ${exclusiveMinimum}`);
    }
  }

  if (typeof value === "string" && typeof schema.minLength === "number") {
    if (value.length < schema.minLength) {
      problems.push(`${at}: cadena más corta que ${schema.minLength}`);
    }
  }

  if (Array.isArray(value)) {
    if (typeof schema.minItems === "number" && value.length < schema.minItems) {
      problems.push(`${at}: ${value.length} elementos, mínimo ${schema.minItems}`);
    }
    if (schema.items) {
      value.forEach((item, i) => {
        problems.push(
          ...validateAgainstSchema(item, schema.items as Schema, root, `${at}[${i}]`)
        );
      });
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, Json>;
    const keys = Object.keys(record);
    const properties = (schema.properties ?? {}) as Record<string, Schema>;

    for (const required of (schema.required ?? []) as string[]) {
      if (!(required in record)) problems.push(`${at}: falta "${required}"`);
    }
    if (typeof schema.minProperties === "number" && keys.length < schema.minProperties) {
      problems.push(`${at}: ${keys.length} claves, mínimo ${schema.minProperties}`);
    }
    if (typeof schema.maxProperties === "number" && keys.length > schema.maxProperties) {
      problems.push(`${at}: ${keys.length} claves, máximo ${schema.maxProperties}`);
    }

    for (const key of keys) {
      if (properties[key]) {
        problems.push(
          ...validateAgainstSchema(record[key], properties[key], root, `${at}.${key}`)
        );
      } else if (schema.additionalProperties === false) {
        problems.push(`${at}: clave no declarada "${key}"`);
      } else if (
        schema.additionalProperties &&
        typeof schema.additionalProperties === "object"
      ) {
        problems.push(
          ...validateAgainstSchema(
            record[key],
            schema.additionalProperties as Schema,
            root,
            `${at}.${key}`
          )
        );
      }
    }
  }

  return problems;
}

function resolveRef(root: Schema, ref: string): Schema {
  if (!ref.startsWith("#/")) throw new Error(`Sólo se resuelven refs locales: ${ref}`);
  let node: Json = root;
  for (const segment of ref.slice(2).split("/")) {
    node = (node as Record<string, Json>)[segment];
    if (node === undefined) throw new Error(`Ref sin destino: ${ref}`);
  }
  return node as Schema;
}

/** Las palabras del esquema que el validador de arriba entiende. */
export const SUPPORTED_KEYWORDS = new Set([
  "$schema",
  "$id",
  "title",
  "definitions",
  "$ref",
  "allOf",
  "type",
  "enum",
  "required",
  "properties",
  "additionalProperties",
  "items",
  "minItems",
  "minLength",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "minProperties",
  "maxProperties",
]);

/** Recorre el esquema y devuelve las palabras que el validador ignoraría. */
export function unsupportedKeywords(schema: Json, found = new Set<string>()): Set<string> {
  if (Array.isArray(schema)) {
    schema.forEach((item) => unsupportedKeywords(item, found));
    return found;
  }
  if (schema === null || typeof schema !== "object") return found;

  for (const [key, value] of Object.entries(schema as Record<string, Json>)) {
    // Bajo `properties` y `definitions` las claves son nombres, no palabras.
    if (key === "properties" || key === "definitions") {
      Object.values(value as Record<string, Json>).forEach((sub) =>
        unsupportedKeywords(sub, found)
      );
      continue;
    }
    if (!SUPPORTED_KEYWORDS.has(key)) found.add(key);
    unsupportedKeywords(value, found);
  }
  return found;
}
