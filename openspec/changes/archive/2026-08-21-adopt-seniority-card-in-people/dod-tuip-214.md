# DoD de la HU TUIP-214 — el punto que cierra este change

Este change existe para cerrar el último punto de la Definición de Terminado de la historia. Los otros seis los cubrió `add-seniority-card-component` en el repo `tuip`; su propia revisión está en `tuip/openspec/changes/add-seniority-card-component/dod-tuip-214.md`.

## El punto

> **Listado de personas y drawer de creación migrados al componente, sin código local duplicado.**

| Parte | Estado | Dónde |
| --- | --- | --- |
| Listado migrado | ✅ | `PeopleList.tsx` — la celda de Seniority renderiza `SeniorityCard` en densidad compacta, con `person.seniorityLabel` tal cual. `Badge` dejó de importarse. |
| Drawer migrado | ⛔ Fuera de alcance | La revisión visual acotó la adopción **sólo al listado**. Ver abajo. |
| Sin código local duplicado | ✅ | Ver abajo. |

## El drawer sale de alcance

La primera versión de este change migraba también el formulario: reemplazaba el `Select` de seniority por `SeniorityChoiceField`, un `<fieldset>` de radios nativos que envolvía cada uno su `SeniorityCard`, y usaba la prop `selected` de la pieza para el refuerzo del elegido.

La revisión visual de la pieza en `tuip` cambió el diseño: `SeniorityCard` perdió fondo, borde y sombra, su etiqueta pasó a texto neutro, y **la prop `selected` se retiró** (grupo 10 de `add-seniority-card-component`). Sin caja ni estado seleccionado, una card no se lee como un control elegible: no hay nada que se vea "prendido". El campo de radios quedaba apoyado en una capacidad que la pieza ya no tiene.

Por eso el drawer vuelve a su `<Select label="Seniority">`, alimentado por el catálogo, y `SeniorityChoiceField.tsx` se borró. El punto 7 de la DoD queda cubierto **sólo por el listado**, que es donde la HU pedía que los niveles se comparen entre filas — y es exactamente lo que la pieza resuelve.

## "Sin código local duplicado": qué se retiró y qué quedó

**Se retiró:**

- El `Badge variant="neutral"` que representaba el nivel en el listado.
- La constante `SENIORITY_OPTIONS` de `personFormValidation.ts`. Era una copia de la escala —con las etiquetas prefijadas por su número, `"1 · Principiante"`— y **no la usaba nadie**: quedó muerta cuando el nivel SFIA se fusionó con seniority. Retirarla es exactamente lo que el guardarraíl pide, así que se borró en vez de sólo quitarle el prefijo. No vuelve con el `Select` restaurado, que se alimenta del catálogo.
- `SeniorityChoiceField.tsx`, las ~90 líneas del campo de radios, junto con el ajuste de grilla que le hacía sitio.

**Quedó:** el mapeo `seniorityOptions` del drawer — tres líneas que convierten `{ value: number, label: string }` del catálogo al `{ value: string, label: string }` que el `Select` espera. No es una copia de la escala: los nombres siguen llegando del catálogo, y acá sólo se adapta el tipo del valor.

Ningún archivo de la app decide colores, medidas ni segmentos del nivel. Eso lo pone entero `SeniorityCard`.

## Cobertura de pruebas

La suite de `people` queda en **72 casos**, dos más que los 70 con los que arrancó. Los dos nuevos están todos en el listado:

- `PeopleList.test.tsx` (2 casos nuevos + 1 aserción ampliada): un valor fuera de la escala cae en el estado vacío sin romper la fila, todas las celdas piden el mismo ancho, y el nivel llega a tecnologías de asistencia por el medidor y el nombre accesible de la card.

**Lo que se retiró de la suite** al salir el drawer de alcance: `SeniorityChoiceField.test.tsx` (10 casos) y `PersonFormDrawer.test.tsx` (6 casos, archivo que este change había creado). La cobertura del formulario vuelve a ser la que había antes de la HU: ninguna prueba toca su `Select` de seniority, igual que antes.

**Nota sobre el plan:** `design.md` decía originalmente que las pruebas del formulario "se reescriben" de `Select` a radios. Era falso — no existía ninguna prueba que tocara ese `Select`, ni un `PersonFormDrawer.test.tsx`. El documento quedó corregido, y con el drawer fuera de alcance la cuestión ya no se plantea.

## Lo que falta verificar a ojo

Dos tareas necesitan la app corriendo y una persona mirando:

- **1.3** — recorrer Personas, Asignaciones, Squads, Home y Parámetros para confirmar que la actualización del paquete no movió nada de lo existente.
- **2.3** — que las cards de filas distintas queden alineadas y que "Principiante" no recorte ni descuadre la columna. La prueba verifica que las cuatro pidan la misma medida, pero jsdom no maqueta: nadie midió píxeles pintados.

La tercera, **3.8** (recorrer el campo de radios sólo con teclado), desaparece junto con el campo.

## Fuera de alcance, como estaba planificado

Editar el seniority desde el listado, las tarjetas de resumen del encabezado, el filtro de Seniority, y cualquier cambio en backend, mocks o catálogo. Se suma el drawer, por el motivo de arriba.

## Fallos preexistentes en la suite del frontend

Dos, ninguno relacionado con este change ni con la feature `people`:

- `src/app/__test__/App.test.tsx` importa `"./App"` desde dentro de `__test__/`; la ruta correcta sería `"../App"`. El archivo no colecta.
- `src/shared/services/__test__/httpClient.test.ts` espera un `baseURL` definido, pero `VITE_BASE_URL` no está seteada en el entorno de pruebas.

Ambos ya fallaban el typecheck antes de tocar nada.
