import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

/**
 * Builds @tuya-ui/tokens and @tuya-ui/components and packs them into .tgz
 * files other local projects can install directly — no npm registry, no
 * private registry, nothing to publish.
 *
 * **Cada empaquetado incrementa la versión.** No es cosmético: el consumidor
 * instala por ruta (`file:...tuya-ui-components-0.1.0.tgz`) y las herramientas
 * que optimizan dependencias derivan su caché de esa ruta y esa versión. Un
 * paquete que cambia de contenido sin cambiar de identidad les hace concluir
 * —con razón, dada su información— que no hay nada que reconstruir, y siguen
 * sirviendo lo que tenían. El síntoma no es un error de instalación: es un
 * módulo que dice no exportar algo que sí exporta, con el mensaje acusando al
 * componente en vez de a la caché.
 */

/** Los paquetes que salen de acá, en orden de dependencia. */
const PACKAGES = [
  { dir: "packages/tokens", tarball: "tuya-ui-tokens" },
  { dir: "packages/components", tarball: "tuya-ui-components" },
] as const;

/**
 * Sube el `PATCH`. MAJOR y MINOR se escriben a mano antes de empacar, porque
 * dependen de si el cambio rompe la API o agrega algo — y eso no se deduce del
 * número anterior.
 */
export function bumpPatch(version: string): string {
  const parts = version.split(".");
  if (parts.length !== 3 || parts.some((p) => !/^(0|[1-9]\d*)$/.test(p))) {
    throw new Error(
      `La versión "${version}" no es MAJOR.MINOR.PATCH.`
    );
  }
  const [major, minor, patch] = parts.map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

/** El nombre del tarball de una versión — es también su registro de distribución. */
export function tarballName(prefix: string, version: string): string {
  return `${prefix}-${version}.tgz`;
}

/**
 * Rechaza distribuir contenido bajo una versión que ya salió. El listado de
 * tarballs es el registro: si el nombre está, ese contenido ya se distribuyó
 * con ese nombre, y repetirlo hace que el consumidor sirva una copia vieja sin
 * enterarse.
 */
export function assertNotDistributed(
  tgz: string,
  existing: string[],
  pkgName = "el paquete",
  dir = "su package.json"
): void {
  if (!existing.includes(tgz)) return;
  throw new Error(
    `Ya existe ${tgz}: esa versión de ${pkgName} ya se distribuyó.\n` +
      `Distribuir contenido distinto bajo la misma versión hace que el consumidor sirva una copia vieja sin enterarse.\n` +
      `Sube la versión a mano en ${dir} y vuelve a empacar.`
  );
}

// ── Autoprueba: un guardia que nunca rechaza no es un guardia ────────────────
//
// La comprobación de abajo depende de dos cosas: que la versión suba de verdad,
// y que el nombre del tarball cambie con ella. Si cualquiera de las dos deja de
// cumplirse, el consumidor vuelve a servir una copia vieja sin enterarse, que
// es exactamente lo que este script existe para impedir.
{
  const antes = "0.1.0";
  const despues = bumpPatch(antes);
  if (despues === antes) {
    throw new Error(
      "[autoprueba] bumpPatch no incrementa la versión. Sin incremento, el nombre del " +
        "tarball se repite y la caché del consumidor no se invalida."
    );
  }
  if (tarballName("x", antes) === tarballName("x", despues)) {
    throw new Error(
      "[autoprueba] El nombre del tarball no cambia con la versión. Es el nombre —y no " +
        "el contenido— lo que el consumidor usa para decidir si algo cambió."
    );
  }
  let rechazado = false;
  try {
    bumpPatch("0.1");
  } catch {
    rechazado = true;
  }
  if (!rechazado) {
    throw new Error(
      "[autoprueba] bumpPatch acepta una versión que no es MAJOR.MINOR.PATCH, así que " +
        "podría producir un nombre de tarball impredecible."
    );
  }

  // El guardia de colisión: tiene que rechazar una versión ya distribuida y
  // dejar pasar una nueva. Es el que impide reempacar sobre el mismo nombre.
  let colisionRechazada = false;
  try {
    assertNotDistributed("x-0.1.0.tgz", ["x-0.1.0.tgz"]);
  } catch {
    colisionRechazada = true;
  }
  if (!colisionRechazada) {
    throw new Error(
      "[autoprueba] El guardia deja reempacar una versión ya distribuida. Con eso, dos " +
        "contenidos distintos pueden salir bajo el mismo nombre."
    );
  }
  assertNotDistributed("x-0.1.1.tgz", ["x-0.1.0.tgz"]);

  console.log("[autoprueba] la versión sube, el nombre cambia con ella, y una ya distribuida se rechaza.");
}

const root = process.cwd();
const outDir = join(root, ".local-packages");
mkdirSync(outDir, { recursive: true });

type Packed = { name: string; dir: string; from: string; to: string; tgz: string };

// ── 1. Subir la versión y comprobar que esa versión no se distribuyó antes.
//       El tarball que ya existe ES el registro: si está, ese nombre ya salió.
const packages: Packed[] = PACKAGES.map(({ dir, tarball }) => {
  const pkgPath = join(root, dir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
    name: string;
    version: string;
  };
  const from = pkg.version;
  const to = bumpPatch(from);
  const tgz = tarballName(tarball, to);

  assertNotDistributed(tgz, readdirSync(outDir), pkg.name, `${dir}/package.json`);

  pkg.version = to;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`${pkg.name}: ${from} → ${to}`);
  return { name: pkg.name, dir, from, to, tgz };
});

// ── 2. Construir y empacar.
for (const { name } of packages) {
  console.log(`\nBuilding ${name}...`);
  execSync(`pnpm --filter ${name} run build`, { stdio: "inherit", cwd: root });
}

for (const { name, dir } of packages) {
  console.log(`\nPacking ${name}...`);
  execSync(`pnpm pack --pack-destination "${outDir}"`, {
    stdio: "inherit",
    cwd: join(root, dir),
  });
}

// ── 3. Comprobar que salió lo esperado, y recién ahí limpiar lo viejo.
//       Empacar primero y borrar después es lo que hace detectable una colisión
//       de nombre: borrar antes la taparía.
for (const { name, tgz } of packages) {
  if (!existsSync(join(outDir, tgz))) {
    throw new Error(
      `pnpm pack no generó ${tgz} para ${name}. No se borra nada: el estado anterior queda intacto.`
    );
  }
}

const keep = new Set(packages.map((p) => p.tgz));
for (const file of readdirSync(outDir)) {
  if (file.endsWith(".tgz") && !keep.has(file)) rmSync(join(outDir, file));
}

// ── 4. Decir exactamente qué instalar. La ruta cambió con la versión, y es ese
//       cambio el que invalida la caché del consumidor.
console.log("\nListo. En el proyecto consumidor, actualiza estas dependencias:\n");
for (const { name, tgz } of packages) {
  console.log(`  "${name}": "file:../tuip/.local-packages/${tgz}"`);
}
console.log(
  "\nY reinstala. La ruta nueva es lo que obliga a reoptimizar la dependencia:\n" +
    "sin ella, el empaquetador sigue sirviendo el bundle anterior."
);
