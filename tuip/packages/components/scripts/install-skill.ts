#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { cpSync, existsSync, realpathSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Copies the Tuya UI design-system Skill (bundled inside this package's own
 * dist/skill, generated at build time — see generate-skill.ts) into the
 * consumer project's .claude/skills/, so Claude Code picks it up. Only ever
 * writes there: the destination is fixed, never read from configuration.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillSource = join(__dirname, "skill");

if (!existsSync(skillSource)) {
  console.error(
    `No se encontró la Skill empaquetada en ${skillSource}. Este comando debe correr desde un @tuya-ui/components instalado (node_modules), no desde el código fuente sin build.`,
  );
  process.exit(1);
}

const projectRoot = realpathSync(process.cwd());
const target = resolve(projectRoot, ".claude/skills/tuya-ui-design-system");

if (!(target === projectRoot || target.startsWith(projectRoot + "\\") || target.startsWith(projectRoot + "/"))) {
  console.error("El destino de instalación quedó fuera del proyecto actual. Abortando sin escribir nada.");
  process.exit(1);
}

if (existsSync(target)) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `Ya existe una Skill instalada en ${target}. ¿Sobrescribir? (y/N) `,
  );
  rl.close();
  if (answer.trim().toLowerCase() !== "y") {
    console.log("Cancelado. No se modificó nada.");
    process.exit(0);
  }
  rmSync(target, { recursive: true, force: true });
}

cpSync(skillSource, target, { recursive: true });
console.log(`Skill instalada en ${target}`);
