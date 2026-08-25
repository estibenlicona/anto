## Why

El Sidebar y el lienzo de la página son literalmente el mismo color: los dos usan `background.neutral.subtlest`. No se parecen, son el mismo token, 1.00:1. Lo único que separa la navegación del contenido es un filete de 1px. La barra superior, en cambio, ya es blanca. El resultado es un shell partido en dos criterios: media chrome sobre una superficie y media sobre otra, y ninguna de las dos se distingue del área de trabajo.

Poner el Sidebar en blanco lo alinea con la barra superior y deja el shell entero en un plano y el contenido en otro. Es la jerarquía que la pantalla no tiene hoy.

El cambio no puede hacerse solo. **El ítem activo del Sidebar usa hoy `background.neutral.default` —blanco— precisamente para destacarse contra el `subtlest` de la barra.** Con la barra en blanco, ítem y fondo quedan del mismo color y el ítem activo pierde su fondo distinto. Eso no es sólo un problema visual: el requisito vigente "Ítem activo del Sidebar" exige **tres señales simultáneas** —riel, fondo distinto y peso de texto— y quedarían dos. Mover la superficie sin mover el ítem activo incumple un acuerdo ya tomado, así que van juntos.

## What Changes

- La superficie del Sidebar pasa de `background.neutral.subtlest` a `background.neutral.default`, el mismo blanco que ya usa la barra superior en su variante clara.
- El ítem activo deja de usar el blanco y pasa a `background.neutral.selected`, el token que el sistema ya documenta para esto: los pasos más claros de la marca, reservados a selección y fila activa. Conserva su riel y su peso de texto, de modo que las tres señales del requisito siguen presentes.
- No se agrega ni se modifica ningún token: los tres involucrados —`default`, `subtlest` y `selected`— ya existen y están definidos en ambos modos.
- El lienzo de la página no se toca. Sigue en `subtlest`, que es lo que hace que el Sidebar blanco se despegue de él.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `component-library`: se incorpora el requisito de que la superficie del Sidebar se distinga del lienzo por sí misma, y el requisito del ítem activo pasa a exigir que su fondo se distinga del de la propia barra —hoy sólo pide "un fondo distinto", que era suficiente cuando la barra no era blanca y deja de serlo ahora.

## Impact

- `packages/components/src/sidebar.tsx` — la superficie de la barra y el fondo del ítem activo.
- `apps/docs` — la página de Sidebar, si documenta sus superficies.
- Toda pantalla del consumidor que use Sidebar cambia de aspecto. Es el objetivo. No hay cambio de API, así que ningún consumidor edita código, pero hace falta reconstruir y reempaquetar para que llegue.
- El estado de hover de los ítems inactivos usa `subtle-hover`. Sobre una barra blanca sigue leyéndose, pero conviene mirarlo junto al ítem activo: activo, hover y reposo tienen que quedar distinguibles entre sí, y ahora los tres se dibujan sobre blanco.

## Lo que este cambio no resuelve

El lienzo de la página difiere de una superficie blanca en 1.04:1. Poner el Sidebar en blanco lo separa del contenido, pero por muy poco: el filete de la derecha va a seguir haciendo buena parte del trabajo. Si la separación entre shell y contenido sigue costando después de esto, el siguiente lugar a mirar es el valor de `subtlest`, no el del Sidebar.
