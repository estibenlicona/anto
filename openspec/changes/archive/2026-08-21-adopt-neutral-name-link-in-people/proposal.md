## Why

El listado de Personas tiene una tabla de seis columnas y un enlace por fila: el nombre. Ese enlace se escribió a mano con `text-brand-default hover:underline focus-visible:ring-brand-focus-ring` (`PeopleList.tsx:164`), que era el único tratamiento posible cuando se agregó — el sistema de diseño no tenía enlace.

El resultado es que la primera columna entera se ve roja. En un párrafo, el rojo de marca sobre un enlace dice "acá está lo importante"; repetido diez, veinte o cincuenta veces hacia abajo, deja de señalar nada y pasa a leerse como una columna teñida que compite con el resto de la fila. El pedido es quitarle ese rojo a los nombres, y que la decisión del tono sea una opción de la pieza y no un color escrito a mano fila por fila.

## What Changes

- **El nombre deja de escribirse con clases propias y pasa a usar el `Link` del sistema de diseño**, con `tone="neutral"`: color de texto neutro, sin rojo de marca, anillo de foco también neutro.
- **El nombre deja de tener señal visual en reposo.** Sin el color, lo que distingue al nombre del texto plano de la fila es el subrayado que aparece al pasar el puntero y al enfocarlo con el teclado. Es la opción que el usuario eligió explícitamente frente al subrayado permanente, y cambia lo que el spec de `people` puede prometer: el escenario "El nombre se reconoce como enlace" describe hoy un reconocimiento en reposo que deja de ser cierto.
- **No cambia nada más de la fila**: el destino sigue siendo `/app/lead/personas/:id`, el correo sigue debajo en su tratamiento secundario, el avatar sigue decorativo y el menú de acciones sigue donde está.
- **Se actualiza la dependencia del sistema de diseño** al `.tgz` que trae `Link`. La ruta en `package.json` no cambia —el nombre del archivo mantiene la versión `0.1.0`—, así que es reinstalar, no reescribir la dependencia.

### Fuera de alcance

- **Cambiar el tono de cualquier otro enlace.** El único enlace con estilo de toda la aplicación es éste; el `<Link to="/auth/login">` de `HomePage` no tiene tratamiento visual y se queda como está.
- **Construir la pantalla de detalle.** Sigue sin existir, y un clic sigue cayendo en "no encontrado", tal como estableció el change `add-people-name-link-and-email`. Este change cambia cómo se ve el enlace, no adónde lleva.
- **Volver clickeable la celda entera o el avatar.** Las razones por las que el enlace es sólo el nombre no cambian con el tono.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `people`: en el listado, el nombre sigue siendo un enlace pero deja de distinguirse del texto plano en reposo — se revela al pasar el puntero o al alcanzarlo con el teclado — y deja de mostrarse en el color de marca (MODIFIED sobre "Listar personas").

## Impact

- **Dependencias**: `@tuya-ui/components` se reinstala desde el `.tgz` regenerado por el change `add-link-component` del repositorio `tuip`. Sin ese change publicado, éste no puede aplicarse. `@tuya-ui/tokens` no cambia.
- **Listado**: `frontend/src/features/people/components/PeopleList.tsx` — la celda de la primera columna. El `Link` de `react-router-dom` pasa a importarse con alias para convivir con el `Link` del sistema de diseño, que lo envuelve con `asChild`.
- **Pruebas**: `frontend/src/features/people/components/__test__/PeopleList.test.tsx` — la aserción existente sobre el `href` del nombre sigue valiendo tal cual; se suma la de que el nombre no se presenta en el color de marca.
- **Sin impacto**: backend, contrato HTTP, handlers de MSW, rutas, navegación lateral, el resto de las columnas y el menú de acciones por fila.
