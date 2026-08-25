## Why

El panel de Modal y el de Drawer no tienen borde. Se apoyan sólo en su sombra y en el overlay que oscurece lo de atrás. Sobre un fondo claro eso no alcanza: el panel es blanco, su borde superior no recibe sombra —`shadow-lg` se proyecta hacia abajo— y el resultado es que la parte de arriba del diálogo se funde con la pantalla.

No es una decisión del sistema, es un hueco. El resto de las superposiciones con panel claro **sí** llevan borde: Popover, Menu, Select, Combobox, CommandPalette, DateCalendar y NotificationMenu usan todas `border border-neutral-default`. Modal y Drawer son las dos únicas que no, y son justamente las de mayor jerarquía — las que comparten `@radix-ui/react-dialog`, `z-overlay` y `shadow-lg`.

Tooltip y Toast también van sin borde, pero ahí sí hay motivo: usan `bg-neutral-bold`, una superficie casi negra con texto inverso, que se recorta sola contra cualquier fondo claro. Un borde no les aportaría nada. La regla que emerge no es "las superposiciones no llevan borde" sino "las de panel claro sí, las de burbuja oscura no" — y Modal y Drawer están del lado claro.

## What Changes

- El panel de `Modal` suma `border border-neutral-default`, el mismo trazo que ya usan las demás superposiciones de panel claro.
- El panel de `Drawer` suma el mismo borde, por el mismo motivo y para que las dos piezas de la familia se comporten igual.
- No se toca `Tooltip` ni `Toast`: su superficie oscura ya los delimita y sumarles un trazo sería ruido.
- No se toca la sombra de ninguno de los dos: sigue siendo lo que comunica su elevación sobre el resto de la página.
- No se agrega ni se modifica ningún token: `border.neutral.default` ya existe y está definido en ambos modos.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `component-library`: el requisito de comportamiento compartido de Modal y Drawer pasa a cubrir también cómo se delimita su panel, que hoy no dice nada al respecto y por eso el hueco pudo existir sin que ninguna verificación lo notara.

## Impact

- `packages/components/src/modal.tsx` — una clase en el panel.
- `packages/components/src/drawer.tsx` — una clase en el panel.
- `apps/docs` — las páginas de Modal y Drawer, si describen la superficie del panel.
- Toda pantalla del consumidor que abra un Modal o un Drawer. Requiere reconstruir y reempaquetar. No hay cambio de API.

## Una limitación que conviene saber de antemano

En modo oscuro el token vale `#3C3C44` y el panel es `#17171B`: da **1.64:1**, así que el borde va a estar presente pero será tenue. En modo claro la relación es todavía menor, 1.28:1 contra el blanco del panel. Es el trazo estándar del sistema y usarlo mantiene la consistencia, que es el objetivo; pero si lo que se busca es un contorno que se imponga, este token no lo da y el problema pasa a ser el valor del trazo, no qué componentes lo llevan.
