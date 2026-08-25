## Why

`Toast` es el único componente que el propio catálogo ya menciona por nombre sin haberlo construido todavía: la documentación de `Alert` distingue explícitamente "una confirmación que vive en el flujo" (Alert) de "un Toast efímero", y el token `layer.notification` ya está reservado en la escala de capas con el comentario "Tooltip y toast". La definición de diseño (`design-system/Componentes Tuya.dc.html`, sección "Toast") especifica un comportamiento completo — posición, duración, cola de a uno, extensión con "Deshacer" — que hoy nadie puede reproducir sin volver a escribir esa lógica a mano en cada proyecto consumidor.

## What Changes

- Se agrega `Toast` al catálogo como un sistema de dos piezas: un `ToastProvider` que se monta una vez (normalmente cerca de la raíz de la app) y un hook `useToast()` que expone una función `toast({ message, action?, duration? })` para dispararlo desde cualquier componente. No es un componente presentacional suelto como Alert o Badge, porque su comportamiento (temporizador, cola, posición fija) es exactamente lo que un consumidor no debería reimplementar cada vez.
- Se construye sobre `@radix-ui/react-toast` (temporizador, cola, swipe-to-dismiss y accesibilidad ya resueltos por la primitiva), siguiendo el mismo patrón que ya usan `Select`, `Combobox`, `Switch` y `Tabs` con sus respectivas primitivas de Radix.
- Un solo toast visible a la vez, anclado abajo a la derecha, en la capa `layer.notification` que ya existía reservada para este uso.
- Duración por defecto de 5 segundos; cuando el toast lleva una `action` (ej. "Deshacer"), la duración por defecto pasa a 10 segundos, siguiendo la regla de la definición sin que el consumidor tenga que recordarla en cada llamada.
- Se documenta como guía de uso — no como algo que el componente pueda impedir — que Toast confirma acciones puntuales del usuario y nunca informa errores del sistema, que necesitan quedarse en pantalla (ahí corresponde Alert, distinción que la documentación de Alert ya anticipaba).

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `Toast`; se agrega su requisito de opciones.

## Impact

- `packages/components/package.json`: nueva dependencia `@radix-ui/react-toast`.
- `packages/components/src/toast.tsx`: `ToastProvider`, `useToast` y el render interno del toast, nuevos.
- `packages/components/registry/definitions.ts`: entrada nueva, categoría `feedback`, `status: "stable"`, con su `npmDependencies` declarada.
- `apps/docs/src/content/toast.tsx`: contenido de uso (incluida la distinción con Alert y la regla de duración con acción), anatomía y accesibilidad.
- `apps/docs/src/examples/toast/*.tsx`: ejemplos en vivo, incluido uno con "Deshacer".
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y el requisito de opciones de `Toast`.
- No se agrega ningún token de capa nuevo: `layer.notification` ya existía sin consumidores; este change es el primero en usarlo.
