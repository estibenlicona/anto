# Tuya UI

Sistema de diseño de Tuya CA: design tokens, componentes React de código abierto (estilo
[shadcn/ui](https://ui.shadcn.com)), un CLI (`tuip`) para instalarlos en cualquier app React, y un
sitio de documentación para explorarlos.

Inspirado en [Atlassian Design System](https://atlassian.design), con la identidad de marca de Tuya CA.

## Estructura del monorepo

```
tuip/
├── apps/
│   └── docs/              # Sitio de documentación (React + Vite)
├── packages/
│   ├── tokens/             # @tuya-ui/tokens — fuente de tokens, CSS Variables, preset de Tailwind
│   ├── components/         # Componentes fuente (Button, Input, Card, Badge) + manifiesto (registry)
│   └── cli/                # Paquete "tuip" publicado en npm
├── pnpm-workspace.yaml
└── turbo.json
```

Gestionado con **pnpm workspaces** + **Turborepo**.

## Requisitos

- Node.js >= 18
- pnpm 9.x (`corepack enable` si no lo tienes)

## Empezar

```bash
pnpm install
pnpm run build      # build en orden: tokens -> components (genera registry) -> cli / docs
pnpm run docs:dev    # levanta el sitio de documentación en http://localhost:5173
```

## Flujo de desarrollo

### Agregar un componente nuevo al catálogo

1. Crea el archivo fuente en `packages/components/src/<componente>.tsx`, usando solo clases de
   Tailwind ligadas a tokens semánticos (`bg-background-brand-bold`, `text-text-neutral-default`,
   `border-border-neutral-default`, …) y, si necesitas helpers compartidos, impórtalos con el alias
   `@/lib/...`. Nunca uses colores primitivos ni valores sueltos.
2. **Documenta cada prop propia** con un comentario de documentación: esas descripciones son las que
   alimentan la tabla de props del sitio, que se genera desde los tipos y no se escribe a mano.
3. Declara el componente en `packages/components/registry/definitions.ts`: nombre, categoría,
   descripción, dependencias internas, dependencias npm externas y `extendsElement` (el elemento
   HTML nativo cuyos atributos acepta).
4. Corre `pnpm --filter @tuya-ui/components generate:registry` para regenerar el manifiesto
   (`packages/components/dist/registry.json`), consumido tanto por el CLI como por el sitio. El
   generador falla si un componente no pudo analizarse, así que una extracción rota se detecta en el
   build en vez de publicarse como una tabla vacía.
5. Escribe sus ejemplos en `apps/docs/src/examples/<componente>/<NN>-<slug>.tsx`. Cada archivo
   exporta un `meta` con título y descripción, más el ejemplo como export por defecto. El sitio lee
   ese mismo archivo dos veces —ejecutado para el render y como texto para el snippet— así que el
   código mostrado nunca puede diferir de lo que se ve.
6. Escribe sus guías de uso y notas de accesibilidad en `apps/docs/src/content/<componente>.ts` y
   regístralas en `apps/docs/src/content/index.ts`. Si faltan, las pestañas muestran un estado de
   "documentación pendiente" en vez de aparecer vacías.

Con eso, el componente aparece solo en `tuip list`, en `tuip add <nombre>`, en el catálogo, en
el sidebar bajo su categoría y en la búsqueda — sin tocar la lógica del CLI ni del sitio.

### Cambiar un token de marca

Los tokens viven en `packages/tokens/src`, separados en dos capas: `primitives.ts` (escalas crudas
por familia) y `semantic-colors.ts` (los tokens con nombre que consumen los componentes, derivados
siempre de un primitivo). El resto de las categorías está en `typography.ts`, `elevation.ts`,
`motion.ts`, `shadow.ts` y `border.ts`.

Edita el archivo correspondiente y corre `pnpm --filter @tuya-ui/tokens build`. El cambio se propaga
a las CSS Variables generadas, al preset de Tailwind y a todo lo que las consuma.
`pnpm --filter @tuya-ui/tokens test` verifica que el CSS generado esté sincronizado y que las
combinaciones de texto sobre fondo sigan cumpliendo el contraste mínimo de WCAG AA — si un cambio de
color rompe el contraste, el build falla.

### Probar el CLI localmente

```bash
pnpm --filter tuip build
node packages/cli/dist/index.js init   # dentro de un proyecto React de prueba
node packages/cli/dist/index.js list
node packages/cli/dist/index.js add button
```

`pnpm --filter tuip test` corre una suite end-to-end contra un proyecto temporal (init → add →
verifica los archivos copiados).

### Publicar el CLI a npm

```bash
pnpm run release:cli
```

Esto reconstruye todo el pipeline (tokens → components → cli, regenerando el manifiesto empaquetado)
antes de publicar, para evitar publicar un CLI con un catálogo desactualizado.
