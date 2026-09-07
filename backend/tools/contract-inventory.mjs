#!/usr/bin/env node
/**
 * Inventario del contrato: qué endpoints consume el frontend hoy.
 *
 * Recorre los handlers de MSW (que son la referencia ejecutable de lo que el
 * front acepta) y resuelve sus constantes de URL. El simulador de
 * autenticación (`auth.handlers.ts`) queda fuera: es una herramienta del
 * entorno de desarrollo, no parte del contrato del backend.
 *
 * Uso:  node backend/tools/contract-inventory.mjs [--json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const HANDLERS = path.join(ROOT, "frontend/src/mocks/handlers");

const rows = [];
for (const file of fs.readdirSync(HANDLERS).filter((f) => f.endsWith(".handlers.ts"))) {
  if (file === "auth.handlers.ts") continue; // simulador de auth: fuera del contrato
  const source = fs.readFileSync(path.join(HANDLERS, file), "utf8");
  const consts = {};
  for (const m of source.matchAll(/const (\w*URL\w*|BASE)\s*=\s*"([^"]+)"/g)) {
    consts[m[1]] = m[2];
  }
  for (const m of source.matchAll(/http\.(get|post|put|delete|patch)\(\s*(?:"([^"]+)"|`([^`]+)`|(\w+))/g)) {
    let url = m[2] ?? m[3] ?? m[4];
    if (m[4] && consts[m[4]]) url = consts[m[4]];
    if (m[3]) url = url.replace(/\$\{(\w+)\}/g, (_, v) => consts[v] ?? `{${v}}`);
    // MSW usa `:param`; OpenAPI usa `{param}` — el inventario habla OpenAPI.
    const oasPath = url.replace(/:([A-Za-z]+)/g, "{$1}");
    rows.push({ method: m[1].toUpperCase(), path: oasPath, module: file.replace(".handlers.ts", "") });
  }
}

rows.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  for (const r of rows) console.log(`${r.method.padEnd(6)} ${r.path}  [${r.module}]`);
  console.log(`TOTAL ${rows.length}`);
}
