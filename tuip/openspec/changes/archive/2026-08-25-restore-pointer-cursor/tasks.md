## 1. La regla

- [x] 1.1 Agregar la regla de cursor en `packages/components/src/base.css`, dentro de `@layer base`, y concatenarla en la hoja publicada desde `scripts/build-css.ts`: puntero para `button` y `[role="button"]` no deshabilitados, no permitido para `:disabled` y `[aria-disabled="true"]`.
- [x] 1.2 Excluir lo deshabilitado en el propio selector (`:not(:disabled)`), no confiar en el orden de las reglas.
- [x] 1.3 Dejar escrito en el archivo por qué la regla existe: Preflight de Tailwind v4 dejó de traerla y el catálogo la daba por hecha.

## 2. La verificación que faltaba

- [x] 2.1 Agregar a `scripts/verify-stylesheet.ts` una tercera comprobación sobre la hoja compilada: la regla de cursor está presente y excluye lo deshabilitado.
- [x] 2.2 Comprobar que falla si se quita la regla —el defecto de hoy no lo detectó nada— y que pasa con ella puesta.

## 3. Cierre en el paquete

- [x] 3.1 `pnpm test` en `packages/components`: tipos, verificaciones y suite sin regresiones.
- [x] 3.2 Revisado: los `cursor-pointer` que quedan están sobre `label`, `input`, `[role="menuitem"]`, `[role="option"]` y el pulgar del slider — ninguno es `button` ni `[role="button"]`, así que ninguno es redundante ni contradice la base.

## 4. Verificación en la aplicación

- [x] 4.1 `publish:local` y reinstalar en `frontend` (la versión se incrementa; ver `version-every-local-pack`).
- [x] 4.2 Verificado en la aplicación (mocks + simulador de sesión): Células 15/15 botones con puntero, Personas 22/22, y en Iniciativas el menú de fila y el drawer completo. Ninguna pantalla usa cabeceras ordenables de Table, así que ese caso no se pudo recorrer; la regla alcanza a todo `button` igual.
- [x] 4.3 Un control deshabilitado —"Activar" en el menú de una iniciativa sin evaluar— sigue mostrando el cursor de no permitido, no la manito.
