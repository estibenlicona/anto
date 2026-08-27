## 1. tuip: la hoja publicada respeta el orden base → variante

- [x] 1.1 En `../tuip/packages/components/scripts/build-css.ts`, partir el cuerpo de `@layer utilities` en `anidarUtilidades`: reglas sin variante (selector sin `\:`) a la subcapa `tuya-ui`; reglas con variante y bloques `@media`/`@supports`/`@container` sueltos en `utilities`, detrás de la subcapa. Actualizar el comentario de la función con el porqué (design.md, decisión 1)
- [x] 1.2 En `../tuip/packages/components/scripts/verify-stylesheet.ts`, añadir la comprobación 4: ninguna regla con `\:` en el selector dentro de `@layer tuya-ui`, y al menos una fuera de ella dentro de `utilities`
- [x] 1.3 En `../tuip/packages/components/src/select.tsx`, aceptar `aria-label` opcional y aplicarlo al trigger; cubrirlo en el test de `Select` (el trigger se anuncia con ese nombre cuando no hay `label`)
- [x] 1.4 Compilar tuip (`build` + `test` en `packages/components`, con `verify:stylesheet` en verde), subir la versión a 0.1.11 y empaquetar `tuya-ui-components-0.1.11.tgz` (y tokens si el build lo exige) en `../tuip/.local-packages/`
- [x] 1.5 En `frontend/package.json`, apuntar `@tuya-ui/components` (y tokens si cambió) al 0.1.11; `pnpm install` y confirmar `pnpm-lock.yaml`

## 2. Formulario: tres duraciones de permiso

- [x] 2.1 En `RegisterAbsenceDrawer.tsx`, reemplazar `leaveLength` por `leaveMode: "full" | "half" | "range"` (por defecto `full`) y el `RadioGroup` de duración por tres opciones: "Día completo", "Medio día", "Varios días"
- [x] 2.2 En `RegisterAbsenceDrawer.tsx`, introducir `singleDay = isLeave && leaveMode !== "range"` como la única condición que decide entre `DateField` y `DateRangeField`, el origen de `start`/`end`, los mensajes de fecha y lo que se envía; `edges` a medias sólo con `leaveMode === "half"`
- [x] 2.3 En `RegisterAbsenceDrawer.tsx`, quitar `label="Persona del chapter"` del `Select` de persona y pasar `aria-label="Persona"`
- [x] 2.4 Actualizar el comentario de cabecera del componente: un permiso dura un día, medio día o varios días; el rango de permiso va por días completos
- [x] 2.5 En `RegisterAbsenceDrawer.test.tsx`, cubrir: las tres duraciones existen y "Día completo" nace marcada; "Varios días" pide el rango y oculta "Día del permiso"; un permiso de varios días envía `startDate`≠`endDate` con las dos banderas en `false` y cuenta los días hábiles del rango; volver de "Varios días" a "Día completo" envía el día suelto y no el rango; el selector de persona no tiene rótulo visible y se encuentra por rol con nombre "Persona"

## 3. Mock: un permiso por rango ya se admite

- [x] 3.1 En `absences.handler.test.ts`, añadir el caso de alta de un permiso con inicio y fin distintos y banderas en `false`: se crea y cuenta los días hábiles del rango; y confirmar que medio día sobre más de un día sigue rechazándose

## 4. Verificación

- [x] 4.1 `pnpm test` (suites de absences y mocks) y `pnpm lint` en verde, sin fallos nuevos
- [x] 4.2 En el navegador, `/app/lead/ausencias` → Registrar ausencia → Permiso: marcar cada una de las tres duraciones y ver el punto del radio aparecer y moverse; comprobar que "Varios días" pide rango y cuenta los días; registrar un permiso de tres días y verlo en la tabla con "3"
- [x] 4.3 En el navegador, comprobar que el selector de persona ya no lee "Persona del chapter" y que se opera igual
- [x] 4.4 En el navegador, recorrer pantallas con Checkbox (Asignar personas a línea, Nivel de competencia), Switch, Tabs, Tooltip y Menu: los checks se ven y nada cambió de sitio; abrir los formularios de Personas, Células y Asignaciones y comprobar que siguen iguales (design.md, riesgos)

## 5. Cierre

- [x] 5.1 Archivar `medias-jornadas-y-tipo-directo` (o sincronizar sus specs) antes de archivar este change, para que los deltas MODIFIED de `absence-registration` y `absence-half-days` tengan sobre qué aplicarse
