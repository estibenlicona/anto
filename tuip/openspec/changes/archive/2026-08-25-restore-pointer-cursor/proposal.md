## Why

Desde la migración a Tailwind v4, pasar el puntero sobre un botón ya no muestra la manito: muestra la flecha. Preflight de v4 dejó de asignar `cursor: pointer` a `button` —ahora hereda el `cursor: default` del agente de usuario— y ningún componente del catálogo lo repone.

No es un detalle de gusto: la manito es la señal con la que el puntero distingue lo que se puede accionar de lo que sólo se lee. Sin ella, un botón se ve igual que un párrafo hasta que el usuario lo prueba.

El agujero es amplio y disparejo. Los componentes que traen su propio `cursor-pointer` —Checkbox, Select, Menu, Switch, RadioGroup, SegmentedControl, Combobox, Slider, OptionCard, FileInput, Navbar y NotificationMenu— salieron ilesos. Los que confiaban en Preflight quedaron sin cursor: **Button** —el más usado del catálogo— y con él Chip, FilterButton, Pagination, Table (sus cabeceras ordenables), Modal, Drawer, AppShell, Sidebar y los dos campos de fecha. Esa lista es la prueba de que el problema no es de un componente: es una base que desapareció y que cada componente venía dando por hecha.

## What Changes

- **El catálogo vuelve a mostrar el cursor de puntero en todo lo accionable**, con una regla base en la hoja de estilos del paquete —no un parche componente por componente—: lo que se perdió fue una base, y reponerla en un solo lugar es lo que impide que el próximo componente nazca con el mismo agujero.
- **Lo deshabilitado NO recupera la manito**: mantiene su cursor de "no permitido", que hoy sí funciona porque `Button` lo declara explícitamente. La regla base SHALL respetar esa distinción en todo el catálogo, no sólo en Button.
- **Queda una verificación que lo vigila**, para que la próxima migración no repita el silencio: hoy nada falló cuando el cursor desapareció.

### Fuera de alcance

- Revisar otras diferencias de Preflight entre v3 y v4: este change atiende el cursor, que es el defecto observado.
- Cambiar colores, tamaños o estados de hover de ningún componente.

## Capabilities

### Modified Capabilities

- `component-library`: los estados de interacción pasan a incluir el cursor, no sólo el color: lo accionable SHALL mostrar el cursor de puntero y lo deshabilitado el de no permitido.

## Impact

- `packages/components/src/styles.css` — la regla base del catálogo.
- Verificación: la suite de `packages/components`; el defecto de hoy no lo detectó ninguna prueba.
- Consumidores: la aplicación toma el arreglo al reinstalar el paquete empacado (`publish:local` incrementa la versión, ver `version-every-local-pack`). El defecto se ve hoy en **toda** la aplicación de gestión de capacidad, así que la verificación se hace ahí.
