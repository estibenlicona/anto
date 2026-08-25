## 1. Dependencia del sistema de diseño

- [x] 1.1 Confirmar que el change `add-link-component` del repositorio `tuip` está aplicado y que su `pnpm run publish:local` dejó `tuip/.local-packages/tuya-ui-components-0.1.0.tgz` con `Link` adentro. Sin esto, nada de lo que sigue puede hacerse.
- [x] 1.2 Reinstalar la dependencia en `frontend/` y comprobar que `import { Link } from "@tuya-ui/components"` resuelve y tipa, con `tone` y `asChild` visibles en el tipo. La ruta en `package.json` no cambia: el nombre del `.tgz` conserva la versión `0.1.0`.
- [x] 1.3 Levantar la app y recorrer las pantallas que ya consumen el paquete (Personas, Asignaciones, Squads, Home y Parámetros de admin) para confirmar que la actualización no cambió nada de lo existente — la adición de `Link` es aditiva y ninguna pieza debería verse distinta.

## 2. Celda del nombre en el listado

- [x] 2.1 En `PeopleList.tsx`, renombrar el import de `react-router-dom` a `import { Link as RouterLink } from "react-router-dom"` y agregar `Link` a la lista de imports de `@tuya-ui/components`.
- [x] 2.2 Envolver el `RouterLink` del nombre en `<Link asChild tone="neutral">`, dejando en el `RouterLink` sólo el `to` y el texto del nombre.
- [x] 2.3 Mover `leading-5` al `className` del `Link` del sistema y borrar del `RouterLink` las cuatro clases de tratamiento de enlace (`text-brand-default`, `hover:underline`, `focus-visible:outline-none`, `focus-visible:ring-focus focus-visible:ring-brand-focus-ring`), que ahora las trae la pieza.
- [x] 2.4 Conservar el comentario que explica por qué el interlineado es `leading-5` — sigue valiendo — y actualizar su ubicación si quedó separado de la línea que explica.
- [x] 2.5 Confirmar que en el DOM renderizado hay un solo `<a>` por nombre, sin anclas anidadas, y que conserva su `href`.

## 3. Pruebas

- [x] 3.1 Verificar que el caso existente `links each person's name to their detail screen` (`PeopleList.test.tsx:152`) sigue pasando sin tocarlo: si `asChild` no llegara al ancla, ese `href` desaparecería y el caso fallaría.
- [x] 3.2 Agregar el caso de que el nombre no se presenta en el color de marca: tomar el enlace por su rol y su nombre accesible, y asertar que ninguna de sus clases menciona `brand`. Asertar la ausencia del rojo, no la presencia de un gris concreto — el paso exacto de neutro es asunto de `tuip` y tiene su prueba allá.
- [x] 3.3 Agregar el caso de que el nombre sigue siendo alcanzable con el teclado y anunciado como enlace, que es lo que sostiene la accesibilidad ahora que no hay señal visual en reposo.
- [x] 3.4 Correr `npx vitest run src/features/people` y `npm run lint` en `frontend/`, y confirmar que no hay regresiones nuevas frente al baseline conocido (2 fallos preexistentes: `App.test.tsx` por un import faltante y `httpClient.test.ts` por la variable de entorno).

## 4. Verificación en pantalla

- [x] 4.1 Levantar `pnpm dev:mock`, entrar al listado de Personas y confirmar que la columna de nombres ya no se ve roja y que los nombres se leen con el mismo color que Cargo, Rol y Modalidad.
- [x] 4.2 Pasar el puntero sobre un nombre y confirmar que aparece el subrayado, y que el cursor cambia a mano.
- [x] 4.3 Recorrer una fila con Tab y confirmar que el nombre recibe foco, que el anillo de foco es neutro y no rojo, y que el subrayado también aparece al enfocar.
- [x] 4.4 Hacer ctrl+clic (o clic con el botón central) sobre un nombre y confirmar que abre el detalle en otra pestaña sin perder la página del listado — que es lo que `asChild` preserva frente a las alternativas descartadas en design.md.
- [x] 4.5 Hacer clic normal y confirmar que sigue navegando dentro de la aplicación a `/app/lead/personas/<id>`, que hoy muestra "no encontrado", sin recargar la página entera.

## 5. Cierre

- [x] 5.1 Antes de archivar, revisar el delta de `specs/people/spec.md`: está escrito como unión con los otros tres changes pendientes sobre `Listar personas` (`add-people-name-link-and-email`, `add-identity-avatar-colors`, `adopt-seniority-card-in-people`). Si alguno de ellos cambió de forma o se abandonó en el ínterin, reconciliar el texto antes de archivar. Ver design.md — Decisions.

  **Resultado de la revisión (al aplicar este change):** la unión está completa y no hizo falta reconciliar nada. Se compararon los escenarios de los tres deltas contra el de acá:

  - Los únicos escenarios de los otros que no aparecen en esta unión son seis —`Encabezado del módulo`, `Resumen de personas activas`, `Resumen de FTE disponible`, `Distribución por seniority`, `Un mismo color en las dos vistas` y `El resumen no cambia con la búsqueda o los filtros del listado`— y **los seis pertenecen a `Resumen del módulo de Personas`**, un requisito distinto que este delta no toca. El archivado reemplaza requisito por requisito, así que la modificación que `add-identity-avatar-colors` le hace a `Resumen` sobrevive sin importar el orden.
  - El séptimo, `El nombre se reconoce como enlace`, es el que este change reemplaza a propósito por `El nombre no lleva el color de marca`, `El nombre se revela como enlace al interactuar` y `El nombre no se distingue en reposo`.
  - `adopt-seniority-card-in-people` cambió de alcance mientras tanto (el drawer salió), pero ese recorte es del formulario y no toca el texto de `Listar personas`, que sigue siendo el que esta unión ya incorporaba.

  Sigue valiendo la recomendación de archivar **este change al último** de los cuatro.
