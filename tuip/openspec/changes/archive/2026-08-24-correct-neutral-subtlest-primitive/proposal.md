## Why

El primitivo `neutral[25]` está definido hoy como `#FAFAFA`. El valor exacto que corresponde a ese paso, según lo que el usuario indicó, es `#FAFAFB` — un cambio de 1/255 en el canal azul, imperceptible visualmente, pero es la fuente de verdad la que debe llevar el valor correcto, no una aproximación. Este mismo valor ya se usó por aproximación en `modernize-table-suite` (la cabecera/pie de `Table` se dejaron en `background.neutral.subtlest`, razonando que `#FAFAFB` era "prácticamente idéntico" a `neutral[25]`); esta corrección cierra esa diferencia de raíz en vez de dejarla como una aproximación documentada.

## What Changes

- **`neutral[25]` pasa de `#FAFAFA` a `#FAFAFB`** en `packages/tokens/src/primitives.ts`. No es un paso nuevo de la escala — es la corrección del valor exacto de un paso que ya existe.
- Ningún token semántico cambia de nombre ni de a qué primitivo apunta. Los tres que hoy leen `neutral[25]` (`background.neutral.subtlest` en claro; `text.neutral.default` y `background.neutral.boldPressed` en oscuro) heredan el valor corregido automáticamente, por la arquitectura de dos capas del sistema — no hace falta tocarlos.
- Se reconstruye `@tuya-ui/tokens` (CSS generado) y se vuelve a correr `verify-tokens.ts` para reconfirmar que ningún par de contraste que involucre a `neutral[25]` cae por debajo del mínimo — dado que el cambio es de 1/255, no se espera ningún cambio de resultado, pero el script es la fuente de verdad, no un supuesto.

**Fuera de alcance:**
- No se agrega ningún primitivo nuevo a la escala neutral — dos grises que difieren en 1/255 no tienen lugar como pasos distintos de la misma escala.
- No se toca ningún componente (`table.tsx` u otro): todos consumen el token semántico, nunca el primitivo directamente, así que no tienen nada que cambiar en su propio código.

## Capabilities

Sin capacidades nuevas ni modificadas. El requisito existente "Paleta primitiva de color" (`design-tokens`) ya cubre esto: exige que exista una escala primitiva numerada y que los tokens semánticos deriven de ella, sin fijar valores hexadecimales exactos en el texto de la especificación — de hecho, otro requisito del mismo capability ("Tokens semánticos de color por rol y variante") exige explícitamente que un token se nombre por su rol y no por su apariencia. Corregir un dígito de un valor primitivo es un dato, no un cambio de comportamiento ni de contrato; no hay ningún requisito cuyo texto deba cambiar. Este change declara `skip_specs: true`.

## Impact

- **Tokens**: `packages/tokens/src/primitives.ts` (un valor hex), `packages/tokens/dist/tokens.css` (regenerado por build).
- **Verificación**: `packages/tokens/scripts/verify-tokens.ts` se vuelve a correr (sin cambios de código esperados) para reconfirmar los pares que usan `neutral[25]`.
- **Publicación**: como en cada change anterior de este ciclo, `frontend` sólo ve el valor corregido después de repetir `pnpm pack` en `packages/tokens` (y, si depende de tokens ya compilados dentro del bundle de componentes, también en `packages/components`) y reinstalar.
- Ningún consumidor (componente, app) rompe en tiempo de compilación — es un cambio de valor, no de forma.
