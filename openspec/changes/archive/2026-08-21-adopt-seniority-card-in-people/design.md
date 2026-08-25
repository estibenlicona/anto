## Context

Ver `proposal.md — Why` para la motivación. Lo que sigue es el estado del código que condiciona el cómo.

**El dato ya llega con el nombre del nivel.** El DTO de persona trae `seniorityLabel` (`"Avanzado"`). No hace falta construir ninguna tabla de traducción entre el número 1–4 y el nombre: ya existe, del lado del backend mockeado, y el listado la recibe resuelta.

**El componente del sistema recibe el nivel por nombre.** `SeniorityCard` acepta una unión cerrada de los cuatro nombres de la escala y define un estado vacío para cualquier otro valor. `seniorityLabel` es un `string` sin garantía de tipo en el borde HTTP, así que ahí hay una junta real entre lo que el backend promete y lo que el componente acepta.

**La app no tiene preset de Tailwind propio.** Consume `@tuya-ui/components/styles.css`, un CSS ya compilado que contiene **sólo** las clases que aparecen literalmente en el fuente de `tuip`. Una combinación de utilidades que no exista allá se escribe pero no genera ninguna regla acá. Es la restricción que más condiciona cualquier markup nuevo en esta feature, y ya está anotada en `QuestionPoolModal.tsx`.

**La revisión visual acotó el alcance.** La versión anterior de este plan migraba también el formulario, reemplazando el `Select` de seniority por un grupo de cuatro piezas seleccionables. Ese camino se descartó: la pieza se adopta sólo en el listado. Lo que sigue refleja el alcance reducido.

## Goals / Non-Goals

**Goals:**

- Que el listado tome la representación del nivel del sistema de diseño, sin decidir color, medida ni segmentos por su cuenta.
- Que la actualización del paquete no cambie el aspecto de ninguna otra pantalla.
- Que la feature quede sin copias locales de la escala de seniority.

**Non-Goals:**

- Tocar el formulario de alta y edición. Su `Select` se queda como está.
- Ampliar el sistema de diseño. Si algo falta, se resuelve componiendo, y la ampliación se propone aparte en `tuip`.
- Tocar el contrato de datos, los mocks o el catálogo.

## Decisions

### 1. El nivel viaja por nombre y el borde lo absorbe el estado vacío del componente

El listado pasa `person.seniorityLabel` directamente a la pieza. Si algún día el backend devuelve un nombre fuera de la escala, se renderiza el estado vacío documentado —misma dimensión, etiqueta `Sin nivel`, segmentos vacíos—, que es exactamente para lo que ese estado existe.

**Alternativa considerada:** validar el valor en el adaptador y normalizarlo antes de renderizar. Agrega una lista de nombres válidos mantenida en la app, que es una segunda copia de la escala que el sistema de diseño ya define; y ante un valor inesperado tendría que decidir lo mismo que la pieza ya decide. Descartada: duplica la escala para llegar al mismo resultado.

### 2. La densidad compacta es la de la fila

En el listado la pieza va en densidad compacta (36 px), que es la que corresponde dentro de una fila de tabla. La amplia existe para cuando la pieza es un control, que no es el caso acá.

### 3. Se retira `SENIORITY_OPTIONS`, que ya era código muerto

`personFormValidation.ts` exporta una copia de la escala con las etiquetas prefijadas por su número (`"1 · Principiante"`). No la usa nadie: quedó huérfana cuando el nivel SFIA se fusionó con seniority, antes de esta HU.

Se borra en vez de dejarla. Es una duplicación de la escala que ahora vive en el sistema de diseño, y el guardarraíl de la HU pide justamente eso. No es parte de la migración —el formulario no cambia— pero sí de dejar la feature sin copias.

### 4. Las pruebas: qué sobrevive y qué se agrega

Las del listado assertan sobre el texto del nivel (`getByText("Avanzado")`) y siguen valiendo tal cual: la pieza renderiza la etiqueta como texto. Se suman los casos de la representación nueva —el medidor y su valor, el estado vacío de una persona sin nivel, y que todas las celdas pidan la misma medida.

**Sobre el formulario, conviene dejarlo escrito:** no existe hoy ninguna prueba que interactúe con el `Select` de seniority. No hay `PersonFormDrawer.test.tsx`; `personFormValidation.test.ts` prueba la validación como función pura y `PeopleContainer.test.tsx` no llega a abrir el drawer. Como el formulario no cambia, no hay nada que migrar ahí — y la cobertura que se había escrito para el campo de radios se retira junto con el campo.

**El límite de lo que las pruebas pueden ver:** jsdom no maqueta ni carga la hoja compilada de `tuip`, así que ninguna prueba de esta app mide píxeles. Lo que se puede afirmar es que las celdas piden la misma utilidad de ancho. Que efectivamente se vean alineadas es revisión visual.

## Risks / Trade-offs

- **El change depende de una publicación del otro repositorio** → No puede empezar hasta que `add-seniority-card-component` haya corrido `pnpm run publish:local` en `tuip`, ya con los ajustes de la revisión visual aplicados. La primera tarea es actualizar la dependencia y comprobar que la pieza llega como se espera.
- **La celda de la tabla crece en alto** → La pieza compacta mide 36 px, más que el `Badge` que reemplaza. Las filas se hacen algo más altas, lo que reduce cuántas personas entran en pantalla. Es el costo de que el nivel se lea de un vistazo, que es el objetivo de la HU.
- **Sin caja, la pieza depende del padding de la celda para no pegarse al contenido vecino** → En una tabla eso ya está resuelto por el padding de `TableCell`. Conviene mirarlo igual en la revisión visual, que es donde se detectaría.
- **Actualizar el paquete arrastra todo lo demás que traiga la versión** → Es `MINOR` y aditiva, pero conviene revisar visualmente las otras pantallas que usan el paquete después de reinstalar, no sólo Personas.

## Migration Plan

1. `tuip` publica: el change `add-seniority-card-component`, con los ajustes de la revisión visual aplicados, deja el `.tgz` local actualizado.
2. La app actualiza `@tuya-ui/components` y `@tuya-ui/tokens` y reinstala.
3. Se migra el listado y se ajustan sus pruebas.
4. Se revisa el resto de las pantallas que consumen el paquete, para confirmar que la actualización no movió nada.

Rollback: volver a la versión anterior del paquete y revertir la celda del listado. No hay migración de datos ni cambio de contrato.
