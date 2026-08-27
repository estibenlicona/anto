## Why

Un permiso no siempre cabe en un día: una diligencia dura una mañana, un trámite un día, y una mudanza o un viaje familiar tres. Hoy el formulario de alta obliga a elegir Permiso sobre **un solo día** —entero o medio—, y quien necesita varios días de permiso tiene que registrar uno por uno o disfrazarlo de vacaciones. Además, en el mismo formulario los radios de duración no se ven marcados al elegirlos (el aro cambia de color pero el punto interior no aparece) y el campo de persona repite en su rótulo lo que la sección ya dice.

## What Changes

- **Un permiso se pide de tres formas**: un día completo, medio día, o varios días. Las dos primeras piden un solo día, como hoy; la tercera pide un rango de fechas y se cuenta por días completos. El medio día sigue existiendo sólo sobre un único día: un rango de permiso no admite medias jornadas en sus extremos.
- **Los radios (y las casillas) muestran su estado marcado** en toda la aplicación. La causa no es del formulario sino de cómo se publica la hoja de estilos de tuip: sus utilidades viajan en la subcapa `utilities.tuya-ui` para perder contra las de la aplicación, y eso hace que un `opacity-0` que la app genera para otra pantalla le gane al `peer-checked:opacity-100` del punto del radio y del check de la casilla. Se corrige en tuip, en la construcción de la hoja: las utilidades con variante quedan fuera de la subcapa, como las ordena Tailwind dentro de una sola hoja. Se republica el paquete y la app lo adopta.
- **El campo de persona pierde el rótulo "Persona del chapter"**: la sección ya se titula "Persona" y el rótulo la repetía. El campo conserva su nombre accesible sin texto a la vista.

## Capabilities

### New Capabilities
- `choice-control-state`: los controles de elección compartidos —radio, casilla, interruptor— muestran su estado marcado en cualquier pantalla de la aplicación, sin depender de qué utilidades genere la app por su cuenta.

### Modified Capabilities
- `absence-registration`: "Cómo se piden las fechas depende del tipo" cambia: con Permiso se elige entre un día, medio día o varios días, y sólo la tercera pide rango. La persona se pide sin rótulo visible propio.
- `absence-half-days`: "El medio día es de un permiso, sobre un solo día" deja de afirmar que un permiso no ocupa un rango: un permiso puede abarcar varios días completos; lo que sigue restringido al día único es el medio día.

> Las dos capacidades modificadas nacen en el change `medias-jornadas-y-tipo-directo`, ya implementado pero todavía sin archivar, así que sus specs no están aún en `openspec/specs/`. Este change debe archivarse después de aquel (o tras un `opsx:sync` de aquel), para que el delta tenga sobre qué aplicarse.

## Impact

- `../tuip/packages/components/scripts/build-css.ts`: al anidar `@layer utilities` en la subcapa `tuya-ui`, dejar fuera de ella las reglas con variante (`peer-*`, `group-*`, `hover:`, `md:`…), de modo que sigan por encima de cualquier utilidad base, propia o de la app. `verify-stylesheet.ts` gana una comprobación que lo afirme.
- `../tuip/packages/components/src/select.tsx`: `Select` acepta `aria-label`, para que un campo sin rótulo visible conserve nombre accesible.
- `../tuip/.local-packages/`: nuevo `tuya-ui-components-0.1.11.tgz` (y tokens si hace falta); `frontend/package.json` y `pnpm-lock.yaml` lo adoptan.
- `src/features/absences/components/RegisterAbsenceDrawer.tsx`: la duración del permiso pasa de dos opciones a tres (día completo, medio día, varios días); con "varios días" se pide rango y viajan las dos banderas en `false`; el `Select` de persona sin `label`, con `aria-label="Persona"`.
- `src/mocks/handlers/absences.handlers.ts`: la validación actual ya admite un permiso por rango con banderas en `false` y sigue rechazando medio día sobre más de un día; se confirma con un test, no cambia.
- Tests: `RegisterAbsenceDrawer.test.tsx` (tres duraciones, rango de permiso, persona sin rótulo), `absences.handler.test.ts` (permiso por rango), y en tuip el test de la hoja publicada.
- Fuera de alcance: medias jornadas en los extremos de un rango de permiso; cambiar la fórmula de capacidad; tocar aprobación, rechazo, filtrado o paginación; revisar uno a uno los demás componentes de tuip que usan variantes (quedan cubiertos por el arreglo en la hoja).
