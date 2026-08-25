# Contribuir

## Cambios a `@tuya-ui/components`

Cualquier PR que modifique `packages/components` (la fuente de `@tuya-ui/components`) debe incluir un changeset:

```bash
pnpm changeset
```

Esto abre un prompt interactivo: elegí `@tuya-ui/components`, el tipo de bump semántico que corresponde al cambio, y una descripción orientada al consumidor. Esa descripción es la que termina en el changelog publicado, así que redactala pensando en quien actualiza la librería, no en quien revisa el PR.

Reglas de versionado (ver `openspec/specs/component-library-publishing/spec.md`):

- **`patch`**: corrección que no cambia ninguna prop pública.
- **`minor`**: componente o prop nueva, sin romper lo existente.
- **`major`**: cambio que rompe la API pública de un componente existente (prop renombrada o quitada, comportamiento incompatible). Un `major` requiere además una guía de migración en la descripción del changeset.

Un PR que solo toca `apps/docs`, tooling, o documentación no necesita changeset.

## Probar `@tuya-ui/components` en otro proyecto local (sin publicar a npm)

Mientras no haya publicación a npm ni a un registro privado, `@tuya-ui/components` se prueba en otros proyectos instalando un tarball local:

```bash
pnpm run publish:local
```

Esto compila `@tuya-ui/tokens` y `@tuya-ui/components`, y empaqueta un `.tgz` en `.local-packages/` (gitignored). Al final imprime el comando exacto para instalarlo — algo como:

```bash
npm install "C:\ruta\a\tuip\.local-packages\tuya-ui-components-0.1.0.tgz"
```

Pegalo en la terminal del otro proyecto y listo: queda instalado como cualquier dependencia real (no un symlink), sin que la instalación arrastre nada de npm. Cada vez que cambies algo en `packages/components`, volvé a correr `pnpm run publish:local` y repetí el `install` en el otro proyecto para traer los cambios.

## Release

El pipeline de release corre el build y la verificación estándar del proyecto antes de publicar `@tuya-ui/components`; ver `openspec/changes/adopt-published-component-library/design.md` para el detalle del proceso.
