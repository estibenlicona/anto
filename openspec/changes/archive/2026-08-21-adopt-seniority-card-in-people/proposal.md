## Why

El seniority de una persona se muestra hoy en el listado con `<Badge variant="neutral">`, el mismo componente con el que la aplicación comunica el estado de un elemento. La consecuencia es la que motiva la HU TUIP-214: un dato que describe el nivel de dominio de alguien viaja en el vocabulario visual de los estados, y en la misma fila conviven dos badges diciendo cosas de naturaleza distinta con la misma forma. Además, un badge no deja comparar niveles entre filas: dice el nombre y nada más.

El sistema de diseño ya resuelve el patrón: el change `add-seniority-card-component` del repositorio `tuip` publica `SeniorityCard` —ancho fijo, etiqueta del nivel y cuatro segmentos teñidos según la posición en la escala— junto con la paleta de acento y el `LevelMeter` que la sostienen. Este change es el consumo: cierra el último punto de la Definición de Terminado de la HU.

## What Changes

- **Se actualiza la dependencia del sistema de diseño.** `@tuya-ui/components` y `@tuya-ui/tokens` suben a la versión que trae `SeniorityCard`, `LevelMeter` y la paleta de acento. Es una actualización `MINOR` y puramente aditiva: ninguna pantalla que hoy usa el paquete cambia de aspecto al tomarla.
- **El listado de Personas muestra el seniority con `SeniorityCard`.** La celda de la columna Seniority deja de renderizar un `Badge` y pasa a renderizar la pieza en su densidad compacta, que es la que corresponde dentro de una fila de tabla. El nombre del nivel sigue siendo lo que se muestra —no el número—, así que el contrato de lectura no cambia; lo que cambia es que ahora los niveles se comparan entre filas.
- **Se retira el mapeo local de presentación del seniority.** Ninguna pantalla vuelve a decidir por su cuenta cómo se ve un nivel: la pieza del sistema trae la escala con ella.

### Fuera de alcance

- **El formulario de alta y edición.** La versión anterior de este plan reemplazaba el `Select` de seniority por un grupo de las cuatro piezas seleccionables. La revisión visual descartó ese camino: la pieza se adopta **sólo en el listado**, y el `Select` del drawer se queda exactamente como está. Con eso, el estado seleccionado de la pieza tampoco tiene consumidor acá.
- **Editar el seniority desde el listado**: se sigue editando en el drawer, como establece la HU.
- **Las tarjetas de resumen del encabezado** (`PeopleStatsCards`), que muestran la distribución por seniority como recuento y no como nivel de una persona. El patrón que resuelven es otro.
- **El filtro de Seniority** del listado, que es una selección múltiple sobre un catálogo y no la representación del nivel de alguien.
- **Cualquier cambio en el backend o en los mocks**: el catálogo de seniority y el contrato de la persona quedan exactamente como están.

## Capabilities

### Modified Capabilities

- `people`: en el listado, el seniority deja de mostrarse como una etiqueta de estado y pasa a mostrarse con el componente de nivel del sistema de diseño, comparable entre filas (MODIFIED).

## Impact

- **Dependencias**: `frontend/package.json` — versiones de `@tuya-ui/components` y `@tuya-ui/tokens`; requiere que el change de `tuip` haya republicado el `.tgz` local (`pnpm run publish:local`).
- **Listado**: `frontend/src/features/people/components/PeopleList.tsx` — la celda de Seniority; `Badge` deja de importarse si ninguna otra celda lo usa.
- **Sin impacto en el formulario**: `PersonFormDrawer.tsx` conserva su `Select` de seniority y la grilla de "Información laboral" no se reacomoda.
- **Pruebas**: `PeopleList.test.tsx` asertaba sobre texto plano del nivel (`getByText("Avanzado")`) y sigue valiendo, porque la pieza renderiza la etiqueta como texto. Se suman los casos de la nueva representación.
- **Sin impacto**: backend, contrato HTTP, handlers de MSW, catálogo de seniority, filtros y paginación.

## Nota sobre `personFormValidation.ts`

La constante `SENIORITY_OPTIONS` de ese archivo —una copia de la escala con las etiquetas prefijadas por su número, `"1 · Principiante"`— quedó sin usar cuando el nivel SFIA se fusionó con seniority, antes de esta HU. Se retira igual: es código muerto que duplica una escala que ahora vive en el sistema de diseño, y el guardarraíl de la HU pide exactamente eso. No es parte de la migración, pero sí de dejar la feature sin duplicados.
