## 1. Aritmética: medias jornadas y formato

- [x] 1.1 En `businessDays.ts`, añadir a `countBusinessDays` un tercer parámetro opcional con las marcas de los extremos, restando 0.5 por cada extremo marcado que además sea día hábil
- [x] 1.2 En `businessDays.ts`, añadir `formatBusinessDays(value)`: entero sin decimales, media jornada con un decimal
- [x] 1.3 En `businessDays.test.ts`, cubrir: primer día a medias, último día a medias, los dos, rango de un día a medias, extremo marcado en fin de semana (no descuenta), rango sin días hábiles, y el formato de 3, 4.5 y 0.5

## 2. Contrato y mock

- [x] 2.1 En `absenceService.ts`, añadir `startsHalfDay` y `endsHalfDay` a `AbsenceDto` y a `CreateAbsenceRequest`, y documentar que `businessDays`/`businessDaysInMonth` son fraccionarios
- [x] 2.2 En `absences.handlers.ts`, aceptar las dos marcas al crear y validarlas; devolverlas en cada fila
- [x] 2.3 En `absences.handlers.ts`, aplicar las marcas al conteo del rango completo y al del tramo del mes, evaluando en el recorte si el extremo sigue siendo el de la ausencia (design.md, decisión 3)
- [x] 2.4 Marcar media jornada en una semilla existente y ajustar los tests del handler que afirmen su conteo
- [x] 2.5 En `absences.handler.test.ts`, cubrir el alta con medias jornadas, la relectura del mes y una ausencia a caballo de dos meses con un extremo marcado

## 3. Formulario: tipo directo y medias jornadas

- [x] 3.1 Añadir el icono de Incapacidad al set de tuip (`iconPaths` + familia), o dejar constancia de la alternativa acordada en design.md, decisión 7
- [x] 3.2 En `RegisterAbsenceDrawer.tsx`, sustituir el `Select` de tipo por un grupo `radiogroup` con las tres opciones visibles (icono, nombre, marca de selección en el elegido), operable con teclado
- [x] 3.3 En `RegisterAbsenceDrawer.tsx`, añadir las marcas de media jornada junto al rango: dos cuando el rango abarca varios días, una sola cuando es el mismo día; enviar siempre el par de banderas
- [x] 3.4 En `RegisterAbsenceDrawer.tsx`, mover el conteo a una tira bajo el rango que se recalcule con las fechas y las marcas
- [x] 3.5 En `RegisterAbsenceDrawer.tsx`, añadir la validación de rango sin días hábiles que registrar, señalada en el rango
- [x] 3.6 En `RegisterAbsenceDrawer.test.tsx`, cubrir: elegir tipo con teclado y ratón, marcar media jornada cambia el conteo, el rango de un día enseña una sola marca, y las validaciones (falta tipo, rango invertido, rango sin días hábiles)

## 4. Lectura: días con decimal

- [x] 4.1 En `AbsencesTable.tsx`, formatear la columna de días con `formatBusinessDays`
- [x] 4.2 En `AbsencesStatsCards.tsx`, formatear el total de días hábiles ausentes del mes y concordar el singular sólo en 1 exacto
- [x] 4.3 En `AbsenceAdapter.ts`, confirmar que la suma de días del mes acumula fracciones sin redondear
- [x] 4.4 Ajustar `AbsencesContainer.test.tsx` y `AbsencesStatsCards.test.tsx` a los valores nuevos y añadir un assert de una fila con media jornada

## 5. Encabezado de sección

- [x] 5.1 En `FormSection.tsx`, anular el margen del `h3` con un comentario que explique por qué la clase está ahí
- [x] 5.2 Añadir un test que afirme que el encabezado alinea icono y título y que la fila no crece por encima de la pastilla

## 6. Verificación

- [x] 6.1 `pnpm test` (suites de absences, shared y páginas) en verde y `pnpm lint` sin errores nuevos (siguen los dos fallos previos y ajenos: `App.test.tsx` y `httpClient`)
- [x] 6.2 Revisar en el navegador `/app/lead/ausencias`: registrar una ausencia eligiendo tipo con ratón y con teclado; marcar media jornada en un extremo, en los dos y en un rango de un día, viendo el conteo cambiar; comprobar las validaciones
- [x] 6.3 En el navegador, comprobar la fila registrada en la tabla (días con decimal), el total de la card del mes, y que aprobarla descuenta la mitad que un día completo
- [x] 6.4 En el navegador, abrir dos formularios más de la aplicación (por ejemplo Personas y Asignaciones) y comprobar que el encabezado de sección quedó alineado en ellos también

## 7. Añadidos durante la implementación

- [x] 7.1 Icono `sick-leave` dibujado en el documento de iconografía de tuip, familia domain a 16 y `paths.ts` regenerado
- [x] 7.2 `OptionCard` de tuip gana la prop `icon`, con test propio
- [x] 7.3 Arreglado en tuip que las flechas de `OptionCardGroup` no movieran la selección con el grupo controlado: el orden se lee de los hijos y no de un ref que el grupo vaciaba en cada render
- [x] 7.4 Medias jornadas limitadas al tipo Permiso —formulario, mock, semillas, specs y tests— a pedido del usuario durante la implementación
