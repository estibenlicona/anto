## Context

Ver proposal.md - Why. Hoy `packages/components` es código fuente-para-copiar (Tailwind + `@tuya-ui/tokens` preset), `packages/cli` (`tuip`) copia ese código al consumidor y opcionalmente inicializa Tailwind y los tokens en su proyecto, y `apps/docs` documenta cada componente con su comando de copia. `packages/tokens` ya se publica como paquete npm compilado (`tsup` + generación de `tokens.css` y de un preset de Tailwind) y no cambia en este change.

## Goals / Non-Goals

**Goals:**
- Definir cómo se empaqueta y se estiliza `@tuya-ui/components` para que un consumidor lo instale sin tener que replicar la configuración de Tailwind del proyecto fuente.
- Definir qué pasa con `packages/cli` una vez que instalar ya no requiere copiar ni inicializar nada.
- Definir el proceso de versionado y release que hace cumplible la capability `component-library-publishing`.
- Migrar los ~39 componentes existentes de `packages/components` a esta nueva forma de distribución sin cambiar su comportamiento observable (props, accesibilidad, apariencia).

**Non-Goals:**
- No se construye una herramienta de migración automática (codemod) para los consumidores que ya copiaron componentes; ese trabajo, si se necesita, es un change aparte.
- No se agrega soporte para frameworks distintos de React ni para un sistema de theming en runtime más allá del modo oscuro que los tokens ya soportan.
- No se decide en este change si `packages/cli` se retira del registro de npm o simplemente deja de recibir versiones nuevas; eso es una decisión operativa de publicación, no de arquitectura.

## Decisions

### 1. Empaquetado: paquete compilado con CSS pre-generado, sin dependencia de la configuración Tailwind del consumidor

`@tuya-ui/components` se construye con `tsup` (ESM + CJS + `.d.ts`, consistente con `packages/tokens` y `packages/cli`) y expone sus componentes como exports nombrados (`import { Button } from '@tuya-ui/components'`). Los estilos se compilan en un único archivo (`@tuya-ui/components/styles.css`) generado corriendo Tailwind sobre el código fuente de los componentes en tiempo de build de la librería — no en el proyecto consumidor — e incluye los tokens de `@tuya-ui/tokens`. El consumidor importa ese CSS una sola vez (por ejemplo en su entrypoint) y no necesita tener Tailwind instalado ni extender ningún preset.

**Por qué**: el problema que motiva este change es de gobierno — evitar que cada consumidor termine con una copia de los tokens o del preset de Tailwind ligeramente distinta. Exigir que el consumidor mantenga su propia configuración de Tailwind sincronizada con la del sistema de diseño reproduce el mismo problema en otro nivel. Un CSS autocontenido que se importa una vez es el mismo patrón que usan MUI, Ant Design, Mantine y Radix Themes, y elimina una fuente entera de divergencia.

**Alternativas consideradas**:
- *Paquete que depende de la config de Tailwind del consumidor* (igual al modelo actual pero con componentes compilados en vez de copiados): se descartó porque no resuelve el problema de gobierno — un preset desactualizado en el proyecto consumidor sigue produciendo componentes visualmente distintos entre equipos.
- *CSS-in-JS o vanilla-extract*: requeriría reescribir los 39 componentes en vez de solo cambiar cómo se empaquetan; costo desproporcionado para este change.

### 2. Árbol de exports para tree-shaking

El paquete declara `"sideEffects": ["*.css"]` en su `package.json` y expone cada componente como export nombrado del entrypoint principal (no un import por archivo). Un bundler moderno (Vite, webpack 5, esbuild) elimina del bundle final los componentes no usados por el consumidor.

**Por qué**: mantiene la ergonomía de import (`import { Button, Card } from '@tuya-ui/components'`) sin obligar al consumidor a cargar los ~39 componentes si solo usa unos pocos.

### 3. Destino de `packages/cli` (`tuip`)

Con el CSS autocontenido (Decisión 1), ya no queda nada que `tuip init` necesite hacer: no hay preset de Tailwind que extender ni tokens que copiar. `packages/cli` se retira del monorepo; el paquete publicado en npm se marca como deprecado (`npm deprecate`) con un mensaje que apunta a `@tuya-ui/components` y a la página de instalación del sitio.

**Por qué**: mantener un CLI reducido a un solo comando (`init`) que ya no tiene trabajo real que hacer agrega superficie de mantenimiento sin beneficio. La instalación completa se resuelve con `npm install @tuya-ui/components` más un `import` del CSS.

**Alternativas consideradas**:
- *Conservar `tuip init` como wrapper de `npm install @tuya-ui/components`*: se descartó por no aportar nada sobre invocar `npm install` directamente, una vez que no hay configuración que generar.

### 4. Proceso de versionado y changelog: Changesets

Se adopta [Changesets](https://github.com/changesets/changesets) para `@tuya-ui/components`, ya integrado con monorepos pnpm/Turborepo: cada PR que toca `packages/components` (fuente de `@tuya-ui/components`) declara su changeset (`patch`/`minor`/`major` por paquete afectado), y una acción de release consolida los changesets pendientes en una entrada de changelog y calcula la versión siguiente automáticamente.

**Por qué**: cumple directamente los requisitos de `component-library-publishing` (versionado semántico, changelog legible, guía de migración en majors) sin depender de que alguien recuerde escribir el changelog a mano al momento del release, que es exactamente el tipo de proceso manual que ya falla hoy con el modelo copy-paste.

**Alternativas consideradas**:
- *Versionado y changelog manual* (bump a mano + edición de `CHANGELOG.md`): se descartó por ser propenso a que alguien lo olvide, el mismo modo de falla que este change busca eliminar.

### 5. Publicación de `@tuya-ui/components`

Se reutiliza el patrón ya existente para `packages/tokens` y `packages/cli` (`tsup` build + `pnpm publish` con `publishConfig.access: public`), sujeto al requisito ya vigente de la capability `security` de que la publicación no puede saltarse la verificación estándar ni ocurrir con cambios sin registrar en el control de versiones.

## Risks / Trade-offs

- [Un equipo que necesitaba editar libremente un componente copiado pierde esa libertad] → Es la contrapartida directa del objetivo de gobierno de este change: se documenta en la página de instalación que la personalización profunda pasa por proponer el cambio en `@tuya-ui/components`, no por bifurcar el componente. El código sigue siendo consultable como referencia (ver capability `component-library`).
- [Migrar los 39 componentes a la vez es una superficie grande para un solo change] → Se migran sin cambiar su comportamiento observable (mismas props, mismos tokens, misma accesibilidad), así que el riesgo es de regresión mecánica, no de rediseño; la cobertura de pruebas existente por componente se corre contra el paquete compilado antes de publicar.
- [Consumidores que ya copiaron componentes no reciben la corrección de bugs futuros] → Aceptado explícitamente en el proposal (sin migración retroactiva); se mitiga marcando `tuip` como deprecado con instrucciones claras de adopción hacia `@tuya-ui/components`.

## Migration Plan

1. Construir el pipeline de build de `@tuya-ui/components` (tsup + generación de CSS) sobre `packages/components` sin publicar todavía.
2. Migrar y verificar los 39 componentes contra el paquete compilado (mismos tests, mismo catálogo de ejemplos del sitio).
3. Configurar Changesets y cortar la primera versión `0.1.0` de `@tuya-ui/components`.
4. Actualizar `apps/docs` para instalar y consumir `@tuya-ui/components` en vez de los componentes copiados, y para reflejar las páginas modificadas en la capability `docs-site`.
5. Publicar `@tuya-ui/components`, actualizar las páginas de instalación del sitio, y deprecar `tuip` en npm.

Rollback: mientras `@tuya-ui/components` no llegue a `1.0.0` estable y `tuip` no se haya deprecado en npm, ambos caminos de instalación coexisten sin conflicto — revertir es simplemente no completar el paso 5.
