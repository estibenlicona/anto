## Context

`RegisterAbsenceDrawer` pide hoy, con Permiso, un `DateField` de un día y un `RadioGroup` de dos opciones (`leaveLength: "full" | "half"`); con los otros dos tipos, un `DateRangeField`. El contrato (`CreateAbsenceRequest`) viaja siempre como rango con dos banderas de medio día, y el mock ya admite un permiso con inicio y fin distintos mientras las banderas vayan en `false` (rechaza medio día sobre más de un día y medio día fuera de Permiso).

El bug de los radios se comprobó en el navegador: el `input` queda `checked`, el aro cambia a color de marca (`peer-checked:border-brand-default` gana) pero el punto interior queda con `opacity: 0`. La causa es la capa CSS. tuip publica sus utilidades dentro de la subcapa `utilities.tuya-ui` (`scripts/build-css.ts`, `anidarUtilidades`) para que las utilidades que la app genera en `utilities` a secas le ganen siempre —y así el `p-8` de una pantalla pisa el `p-4` de un componente—. Pero dentro de una capa, lo que no está en subcapa gana a cualquier subcapa **sin mirar especificidad**: el `.opacity-0` que el Tailwind de la app genera porque `SkillLevelCriteria.tsx` lo usa le gana al `.peer-checked\:opacity-100:is(:where(.peer):checked ~ *)` de tuip, aunque este tenga más especificidad y sea una regla de estado. `Checkbox` dibuja su check con el mismo par (`opacity-0` + `peer-checked:opacity-100`), así que padece lo mismo. Cualquier componente cuyo estado dependa de una variante (`peer-*`, `group-*`, `hover:`, `data-[state]`) contra una utilidad base que la app también use está expuesto; que el aro del radio sí funcione es casualidad: la app no genera `border-neutral-bold`.

`Select` no reenvía atributos al trigger (`SelectProps` es cerrada), así que hoy no hay forma de darle nombre accesible sin rótulo visible. `cn` en tuip concatena, no fusiona (no hay `tailwind-merge`).

Ver proposal.md — Why para la motivación.

## Goals / Non-Goals

**Goals:**
- Que un permiso pueda pedirse por un día, medio día o varios días con una sola pregunta más.
- Arreglar el estado visible de radios y casillas donde nace el problema —la hoja publicada— y que la comprobación de la hoja lo afirme para que no vuelva.
- Quitar el rótulo redundante sin perder el nombre accesible del campo.

**Non-Goals:**
- Medias jornadas en los extremos de un permiso de varios días (queda igual que Vacaciones).
- Reescribir `RadioGroup`/`Checkbox` para que dibujen su estado desde React.
- Auditar uno a uno los 18 componentes de tuip que usan variantes: el arreglo en la hoja los cubre a todos.
- Cambiar el contrato del mock ni la aritmética de `businessDays.ts`.

## Decisions

**1. Las utilidades con variante de tuip salen de la subcapa y se quedan en `utilities`, después de ella.**
Dentro de una sola hoja, Tailwind emite las variantes después de las utilidades base justamente para que `peer-checked:opacity-100` gane a `opacity-0`. Al anidar toda la salida en `utilities.tuya-ui`, ese orden se perdió frente a las utilidades base de la app. `anidarUtilidades` pasa a partir el cuerpo de `@layer utilities` en dos: las reglas base (selector sin `\:`) van a la subcapa; las reglas con variante (selector con `\:`, y los bloques `@media`/`@supports`/`@container` que envuelven `md:`, `dark:`, `motion-safe:`…) quedan sueltas en `utilities` **detrás** de la subcapa. Resultado: base de la app > base de tuip (lo que la subcapa ya lograba), y variante de tuip > cualquier base (lo que Tailwind garantiza dentro de una hoja).
*Alternativas:* (a) que `RadioGroup` y `Checkbox` deriven el estado en React y usen sólo clases base — arregla dos componentes, deja el resto expuesto y obliga al modo no controlado a llevar estado propio; (b) que la app importe la hoja de tuip con `layer(utilities)` — la subcapa está declarada dentro del propio archivo, así que anidaría otra vez; (c) que la app evite `opacity-0` — depende de lo que cada pantalla escriba, que es justo lo que no se puede prometer.

**2. `verify-stylesheet.ts` gana una cuarta comprobación: ninguna regla con variante dentro de `@layer tuya-ui`, y al menos una fuera.**
La comprobación 2 del script ya afirma que las utilidades duplicadas dicen lo mismo; esta afirma la forma de la capa. Sin ella, un cambio en la salida de Tailwind podría volver a meter todo en la subcapa "con éxito", como pasó con el build vacío que motivó la comprobación 1.

**3. La duración del permiso es un `RadioGroup` de tres opciones —"Día completo", "Medio día", "Varios días"—, no una casilla más un conmutador de rango.**
Son tres respuestas excluyentes a una sola pregunta ("¿cuánto dura?"); con dos controles el usuario podría combinar "varios días" con "medio día", que la spec prohíbe, y habría que bloquearlo. El estado pasa de `leaveLength` a `leaveMode: "full" | "half" | "range"`; `isLeave` deja de decidir solo y aparece `singleDay = isLeave && leaveMode !== "range"` como la única condición que reparte entre `DateField` y `DateRangeField`. En modo rango se reutilizan `startDate`/`endDate`, sus mensajes de validación y la tira de conteo tal cual, con `edges` en `false`. El contrato no cambia: un permiso de varios días viaja como Vacaciones con `type: "Leave"`, y el mock ya lo admite.
*Alternativa:* tratar todo permiso como rango con medias jornadas en los extremos — reabre la decisión que el change anterior cerró (medio día sólo sobre un día) y multiplica los casos de validación del mock.

**4. `Select` acepta `aria-label`, y el campo de persona lo usa en lugar de `label`.**
Es el cambio más chico en tuip que da nombre accesible a un campo sin rótulo visible: una prop opcional que cae en el trigger. Se descartó `aria-labelledby` hacia el `h3` de `FormSection` (obliga a que la sección genere un id y a que el formulario lo enhebre) y una prop `hideLabel` (más superficie para el mismo efecto). El test que hoy busca `getByLabelText("Persona del chapter")` pasa a buscar el trigger por su rol y el nombre "Persona".

**5. tuip se republica como `0.1.11` en `.local-packages` y la app lo adopta, igual que hizo `medias-jornadas-y-tipo-directo` con 0.1.10.**
El paquete entra por `file:` a un `.tgz`; no hay registro. Cambian `package.json` y `pnpm-lock.yaml`.

## Risks / Trade-offs

- [Una variante de tuip ahora gana a una variante de la app sobre la misma propiedad] → Sólo si la pantalla pasa por `className` una variante que compite con una del propio componente (`md:flex-row` contra un `md:flex-col` interno); `cn` no fusiona, así que ese caso ya era frágil. Se anota en el comentario de `anidarUtilidades` y se comprueba en el navegador que los formularios de Personas, Células y Asignaciones no cambian.
- [Otros componentes cambian de aspecto al arreglar la capa] → Es el efecto buscado (checks de casillas, estados hover/focus que la app pisaba sin saberlo), pero hay que verlo: se recorren en el navegador Checkbox, Switch, Tabs, Tooltip y Menu en pantallas que los usen.
- [Las specs modificadas aún no están en `openspec/specs/`] → `medias-jornadas-y-tipo-directo` sigue sin archivar. Este change se archiva después de aquel (o tras sincronizar sus specs); si se archivara antes, el delta MODIFIED no encontraría los requisitos.
- [`DateRangeField` para un permiso de tres días muestra la misma tira de conteo que Vacaciones] → Deliberado: son días completos y se cuentan igual; no hay nada distinto que decir.
