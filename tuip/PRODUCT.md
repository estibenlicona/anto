# Product

<!-- impeccable:product-schema 1 -->

Este archivo es la verdad de producto de **Tuya UI** para todo el monorepo (`packages/tokens`,
`packages/components`, `apps/docs`). Los tres workspaces lo heredan; no crear copias por app.

## Platform

web

## Users

Confirmados (2026-08-27):

- **Devs frontend internos de Tuya CA.** Instalan `@tuya-ui/components` en aplicaciones React
  (React 18/19, Node ≥ 18) y consultan el sitio de documentación para elegir un componente, leer
  su API generada desde los tipos, copiar un ejemplo y revisar las guías de uso y accesibilidad.
  Su situación típica: construir herramientas internas densas en datos (tablas, formularios,
  paneles); el primer consumidor real es **Torre de Control** (gestión de capacidad de células,
  personas, squads, seniority, asignaciones).
- **Diseñadores de producto.** Usan los fundamentos (color, tipografía, espaciado, iconografía)
  y los canvases de `design-system/*.dc.html` como referencia de marca y de sistema.
- **Agentes de IA (Claude) vía la skill.** Construyen pantallas con la librería cargando la skill
  que empaqueta el catálogo, props, guías y ejemplos (`openspec/specs/ai-skill`; binario
  `install-tuya-ui-skill` publicado con el paquete).
- **Equipos externos / proveedores.** Terceros que desarrollan para Tuya y deben adherir a la
  marca sin reinterpretarla.

## Product Purpose

Tuya UI es el sistema de diseño de Tuya CA: design tokens, componentes React accesibles e
iconografía propia, distribuidos como **un único paquete de npm versionado** más un sitio de
documentación para explorarlos. Existe para que toda interfaz que Tuya construya —interna, de
proveedores o generada por IA— salga con la misma identidad y el mismo nivel de accesibilidad sin
que cada equipo lo rehaga.

Éxito: un equipo instala la dependencia, importa `styles.css` una vez y produce una pantalla que
se ve y se comporta como Tuya sin decidir colores, tamaños ni estados por su cuenta; actualiza la
librería como a cualquier otra dependencia y hereda las mejoras.

## Positioning

Lo que Tuya UI ofrece y una librería genérica (shadcn/ui, Atlassian, Fluent) no puede copiar
honestamente. Confirmado como innegociable por el usuario:

1. **Marca Tuya CA obligatoria.** El rojo Tuya (`brand.500 = #ED1C29`) dirige la acción primaria
   y la posición actual en la navegación, y nada más. Nada de look genérico ni de rojo "de otro
   sistema".
2. **Arquitectura de tokens en dos capas con WCAG AA verificado en el build.** Primitivos →
   semánticos nombrados por rol (`bg/text/border/icon` × rol × énfasis × estado), tema claro y
   oscuro escritos como dos asignaciones explícitas (no una inversión), y un build de tokens que
   **falla** si una combinación texto/fondo baja del contraste AA o si un componente usa un color
   literal en vez de un token. La garantía técnica es parte de la propuesta.
3. **Vocabulario de dominio propio.** Componentes (CapacityBar, DistributionCard, SeniorityCard,
   LevelMeter, Meter, SegmentedBar, ActivityTimeline…) e iconos para gestión de capacidad,
   células y seniority que ninguna librería abierta trae.
4. **Un solo paquete npm versionado.** Se instala y actualiza como dependencia; no se copia
   código al repositorio consumidor. El CLI `tuip` (estilo shadcn "copiá el fuente") quedó
   **retirado** en favor de `@tuya-ui/components` publicado (ver
   `openspec/changes/archive` / `adopt-published-component-library`). Las rutas `/cli` y
   `/estructura` del sitio son redirecciones heredadas.

Referencia de madurez declarada: Atlassian Design System (arquitectura de tokens); inspiración
de mecánica de catálogo: shadcn/ui. Ninguno de los dos es referencia visual.

## Operating Context

- **Monorepo** pnpm workspaces + Turborepo. Pipeline de build en orden: `tokens` → `components`
  (genera `dist/registry.json`) → `docs`. `pnpm run docs:dev` levanta el sitio en
  `http://localhost:5173` (Vite).
- **Fuente única de tokens** en `packages/tokens/src` (`primitives.ts`, `semantic-colors.ts`,
  `typography.ts`, `layout.ts`, `elevation.ts`, `motion.ts`, `shadow.ts`, `border.ts`,
  `identity-colors.ts`, `accent-colors.ts`, `attention-colors.ts`, `gradient.ts`,
  `component-tokens.ts`). Se compila a CSS Variables (`:root[data-theme="dark"]` /
  `prefers-color-scheme`) y a un preset de Tailwind.
- **Componentes** en `packages/components/src` (61 exports; catálogo mínimo exigido en
  `openspec/specs/component-library`). Solo clases de Tailwind ligadas a tokens semánticos;
  helpers compartidos vía `@/lib/...`. Cada prop propia lleva comentario de documentación porque
  la tabla de props del sitio se genera desde los tipos.
- **Sitio de docs** (`apps/docs`): un archivo de ejemplo por caso
  (`src/examples/<componente>/<NN>-<slug>.tsx`) se ejecuta para el render y se lee como texto para
  el snippet, así el código mostrado nunca difiere de lo que se ve. Guías y accesibilidad en
  `src/content/<componente>.tsx`. Búsqueda con atajo de teclado, índice por página, sidebar
  agrupado por categoría.
- **Proceso de cambio:** OpenSpec (`openspec/specs`, `openspec/changes`) documenta requisitos y
  decisiones; changesets obligatorios para cualquier PR que toque `packages/components`
  (`patch` / `minor` / `major` + guía de migración). Idioma de trabajo, docs y UI: **español**
  (voseo rioplatense en la copy del sitio: "instalás", "importás").
- **Consumidor de referencia:** `../frontend` (Torre de Control) es otro proyecto que **usa**
  Tuya UI. El directorio `tuip/src/` es también otro proyecto que utiliza tuip: **no se toca ni
  se documenta como parte del sistema de diseño** (confirmado por el usuario).
- **Prueba local sin publicar:** `pnpm run publish:local` genera un `.tgz` en
  `.local-packages/` para instalarlo en otro proyecto.

## Capabilities and Constraints

- Tokens: color (7 familias semánticas: `neutral`, `brand`, `danger`, `warning`, `success`,
  `info`, `discovery`; 12 colores de identidad para personas, separados a propósito de la
  semántica; degradado de marca con nombre), tipografía (escala de 7 estilos, sin octavo; 4
  pesos con rol), espaciado, radios, sombras, elevación, motion, anchos de borde, breakpoints,
  alturas de control (`32/40/48px`), área táctil mínima `44px`, anchos máximos por tipo de
  contenido (`prose 680`, `form 640`, `panel 480`, `page 1728`).
- Tipografía servida por el host: **IBM Plex Sans** (toda la interfaz, números incluidos) e
  **IBM Plex Mono** (solo cadenas literales: IDs, ramas, código). El paquete no incluye archivos
  de fuente; la vía recomendada es Fontsource.
- Temas claro y oscuro, ambos con contraste verificado por separado.
- Estados de interacción (`hover`, `pressed`, `disabled`, `focus`, `selected`) vienen de tokens
  semánticos, nunca por componente. El cursor forma parte del estado y se hereda desde la base de
  estilos del paquete, no de cada componente.
- Iconografía propia: retícula cuadrada con margen intocable, trazo uniforme que no escala,
  terminales redondas, solo contorno (único relleno: el punto de estado), conjunto cerrado de
  tamaños, nombres en kebab-case por concepto y no por dibujo (`openspec/specs/iconography`).
- Sin Tailwind requerido en el host: los estilos van compilados dentro del paquete.
- Publicación con `access: restricted` (paquete privado). Auditoría de seguridad
  (`security:audit`, `security-exceptions.json`) como parte del release.
- Componentes marcados con madurez `stable` o `beta` (expuesta al agente de IA vía la skill).

### Hechos abiertos (no inventar)

- **Qué es "Tuya CA"** (razón social / unidad de negocio) no está registrado en el repo; usar
  solo "Tuya CA" como nombre y no expandirlo.
- **Logo / marca gráfica:** no hay archivos de logo ni assets de marca en `apps/docs` ni en
  `packages`. Cualquier superficie que necesite el logotipo debe pedirlo al usuario, no
  dibujarlo.
- **Estándar de accesibilidad formal** más allá de WCAG AA de contraste (p. ej. AA completo,
  auditoría con lector de pantalla) no está declarado como requisito de producto.

## Brand Commitments

- Nombre: **Tuya UI** (sistema), **Tuya CA** (marca/organización), `@tuya-ui/*` (paquetes).
- Color de marca: el rojo Tuya, `#ED1C29` (`brand.500`), reservado a la acción primaria y a la
  posición actual en la navegación. Repartido entre elementos secundarios "deja de dirigir la
  mirada, que es lo único para lo que sirve" (copy de fundamentos).
- Grises ligeramente fríos para que el rojo cálido destaque por contraste de temperatura.
- Tipografías comprometidas: IBM Plex Sans / IBM Plex Mono.
- Voz: español rioplatense, directa, en segunda persona con voseo; explica el porqué de las
  reglas en vez de solo enunciarlas (los comentarios de código y las guías del sitio siguen ese
  mismo registro).
- Referencias de sistema que el usuario declaró como comparables, no como look a copiar:
  Atlassian Design System (tokens), Fluent UI / Teams (paleta de identidad de personas, tomada
  de su fuente).

## Evidence on Hand

- Especificaciones de producto: `openspec/specs/{component-library, component-library-publishing,
  design-tokens, docs-site, iconography, ai-skill, security, skill-installer}/spec.md`.
- Canvases de diseño (Claude Design) en `design-system/`: `Fundamentos Tuya DS`, `Tipografia
  opciones`, `Iconografia Tuya`, `Componentes Tuya`, `Componentes Compuestos Tuya`, `Navbar
  Tuya`, `Sidebar Tuya`, `Torre de Control`, `docs-tuip-standalone-src.html`.
- Catálogo real: `packages/components/src/*.tsx` con tests (`*.test.tsx`), manifiesto
  `packages/components/dist/registry.json`, ejemplos ejecutables en `apps/docs/src/examples`.
- Fundamentos documentados con valores reales: `apps/docs/src/content/fundamentos.tsx`,
  `iconografia.tsx`, `instalacion.ts`.
- Verificación automática: tests de contraste WCAG AA y de sincronía de CSS en
  `packages/tokens`; verificación de colores literales en componentes.
- **Ausencias que el trabajo futuro no debe fabricar:** no hay testimonios, métricas de
  adopción, casos de estudio, precios, ni logotipo en el repo.

## Product Principles

1. **La marca dirige, no decora.** El rojo Tuya señala la acción primaria y la ubicación; todo lo
   demás vive en neutros. Un componente nuevo no gana derecho al rojo por ser nuevo.
2. **La garantía se verifica, no se revisa.** Contraste AA, colores literales, CSS sincronizado y
   props documentadas fallan el build antes que llegar a una revisión manual. Toda regla nueva
   del sistema debería aspirar a la misma automatización.
3. **El nombre sobrevive al rediseño.** Tokens e iconos se nombran por rol y concepto, nunca por
   apariencia; el tema o la forma pueden cambiar sin romper a quien los consume.
4. **Lo que se documenta es lo que se ejecuta.** Ejemplos, tablas de props y snippets salen del
   mismo código que se renderiza; no existe documentación escrita a mano que pueda quedar vieja.
5. **Un paquete, muchos consumidores.** Devs internos, proveedores y agentes de IA reciben el
   mismo catálogo versionado; la escala cerrada (7 estilos tipográficos, 3 alturas de control,
   tamaños de icono fijos) es lo que hace posible que todos produzcan lo mismo.

## Accessibility & Inclusion

- Contraste mínimo **WCAG AA** para texto sobre fondo, verificado en el build de tokens en ambos
  temas y para los 12 colores de identidad.
- Área táctil mínima de `44px` independientemente de la altura visual del control.
- Cada componente del sitio lleva una pestaña de accesibilidad (comportamiento de teclado, foco,
  ARIA) que es parte del entregable, no un anexo.
- Modo claro y oscuro como capacidad de primer nivel del sistema.
