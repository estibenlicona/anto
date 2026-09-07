#!/usr/bin/env node
/**
 * Cobertura del contrato: cruza lo que el frontend consume (inventario de
 * contract-inventory.mjs) contra los `paths` de backend/oas.json.
 *
 * Falla (exit 1) si un endpoint consumido falta en el contrato o si el
 * contrato declara operaciones que nadie consume.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const inventory = JSON.parse(
  execFileSync(process.execPath, [path.join(HERE, "contract-inventory.mjs"), "--json"], { encoding: "utf8" })
);
const oas = JSON.parse(fs.readFileSync(path.join(HERE, "../oas.json"), "utf8"));

const consumed = new Set(inventory.map((r) => `${r.method} ${r.path}`));
const declared = new Set();
for (const [p, ops] of Object.entries(oas.paths)) {
  for (const method of Object.keys(ops)) declared.add(`${method.toUpperCase()} ${p}`);
}

const missing = [...consumed].filter((k) => !declared.has(k)).sort();
const extra = [...declared].filter((k) => !consumed.has(k)).sort();

for (const k of missing) console.error("FALTA EN EL CONTRATO:", k);
for (const k of extra) console.error("SIN CONSUMIDOR:", k);
console.log(`consumidos: ${consumed.size} · declarados: ${declared.size} · cubiertos: ${consumed.size - missing.length}/${consumed.size}`);
process.exit(missing.length || extra.length ? 1 : 0);
