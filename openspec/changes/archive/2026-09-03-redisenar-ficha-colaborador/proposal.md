## Why

La ficha de un colaborador creció por acumulación: hoy son **nueve paneles apilados** —cabecera de cuatro tarjetas, línea de resumen, *Por qué esta señal*, Referencia, Ejecución, Trabajo no planificado, Multitarea, Tendencia, Historias y Mapa de actividad— que el lead recorre en scroll sin que ninguno reclame la atención primero. La señal, que es la respuesta, es la cuarta tarjeta de la fila y ocupa lo mismo que la mediana histórica.

El boceto que el usuario aprobó invierte eso: **la señal ocupa la cabecera y lo demás se guarda detrás de cuatro pestañas**. Se lee la respuesta al abrir, y la evidencia se busca sólo cuando hace falta. Es el mismo cambio de foco que el listado ya recibió en `redisenar-balance-de-carga`; esta ficha era la mitad que faltaba.

## What Changes

- **BREAKING** — **La cabecera pasa de cuatro tarjetas iguales a tres desiguales.** *Balance del sprint* toma dos tercios del ancho con su punto de color, el nombre de la señal en tipografía de titular, la frase que la explica y cuántas señales la sostienen; *Capacidad* y *Demanda vs referencia* la acompañan en un tercio cada una. **La tarjeta de Referencia desaparece de la cabecera**: su contenido ya vive, y mejor, en las tres barras comparables de la pestaña *Señales*.
- **BREAKING** — **La línea de resumen en lenguaje natural se retira.** La reemplaza una **fila de cuatro métricas secundarias** —Cumplimiento, Trabajo no planificado, Carry-over y Foco— cada una con su cifra grande y su lectura al lado ("40 %" · "12 de 30 SP en Closed").
- **BREAKING** — **Los paneles apilados pasan a cuatro pestañas** en una sola tarjeta: **Señales**, **Historias**, **Actividad** y **Tendencia**. Cada pestaña lleva un subtítulo con su resumen ("3 de 6 hacia sobrecarga", "6 historias · 30 SP", "5 días activos · 24 commits", "7 sprints · +0.4 %"), así que el índice de la página se lee sin abrirlas.
- **La pestaña Señales presenta las evidencias como una tabla de tolerancias**: Señal · Valor · Tolerancia, con el veredicto de cada una en palabras ("Fuera de tolerancia", "Dentro de la tolerancia", "No se pudo evaluar: sprint en curso"). A su derecha, la **Referencia** en tres barras y el **Trabajo no planificado** como una barra apilada de lo comprometido al inicio contra lo agregado.
- **BREAKING** — **El selector de sprints deja de ser una tira de pestañas y pasa a ser el navegador de sprint** —flechas anterior/siguiente con el nombre y el rango— alojado en la franja del breadcrumb, junto a la marca *En curso* y a las tres acciones. Es el mismo navegador del listado.
- **El encabezado de identidad se compacta a una línea**: avatar, nombre, y debajo cargo · célula · dedicación declarada · las iniciativas del sprint como marcas con su "+N".
- **BREAKING** — **"Multitarea" pasa a llamarse "Foco"** en la ficha —la tarjeta secundaria, la fila de la tabla de señales y el rótulo de la evidencia—, que es como ya se llama la columna del listado. Las dos pantallas dejan de nombrar distinto lo mismo.
- **La anotación de contexto de célula deja de mostrarse en la ficha.** El boceto no le reserva lugar y se implementa tal cual. La regla no cambia —el comportamiento de la célula sigue sin atenuar la señal— y esa lectura se conserva en el tooltip de la fila del listado.
- **El nombre de la señal de subasignación no cambia**: sigue siendo *Posible subasignación* y no *Margen disponible*, para que el listado, los indicadores, el badge del sidebar y la ficha digan lo mismo.

## Capabilities

### Modified Capabilities

- `real-dedication`: la requirement *Dashboard de balance de un colaborador* cambia por completo su composición —cabecera de tres tarjetas con el balance al frente, fila de cuatro métricas, cuatro pestañas, navegador de sprint en el breadcrumb—, adopta "Foco" como nombre único de la evidencia de multitarea y fija que cada evidencia se lee con su veredicto en palabras además de su cifra.

El vocabulario no entra en `ui-writing`: esa capability fija el **registro** —el español neutro, la misma redacción para la misma acción— y su regla de "una acción no se redacta de dos maneras" ya cubre que "Foco" se diga igual en las dos pantallas. Los nombres del dominio viven donde vive el dominio.

## Impact

- **Contenedor y componentes** — `CollaboratorDashboardContainer` se reorganiza; `SprintTabs` se retira en favor de `SprintNavigator` (ya existe, del listado); `BalanceHeaderCards` se parte en la tarjeta de balance y las dos de cifras; `WhyThisSignalPanel`, `ReferencePanel`, `SprintExecutionPanel`, `UnplannedWorkPanel`, `MultitaskingPanel`, `TrendPanel`, `SprintStoriesPanel` y `ActivityCalendarPanel` pasan a ser el contenido de las cuatro pestañas y pierden su marco de panel.
- **Adapter** — `SelectedSprintView` gana el veredicto por evidencia, los subtítulos de las pestañas y las métricas secundarias ya formateadas; `EVIDENCE_LABELS.multitasking` pasa a "Foco".
- **Franja del breadcrumb** — el navegador de sprint y la marca *En curso* se publican ahí, junto a las acciones que ya viven en el encabezado.
- **Sin cambios de contrato**: ningún DTO nuevo, ningún endpoint nuevo, ningún parámetro nuevo del Calendario. Todo lo que el boceto muestra ya lo responde el mock.
- **Design system** — `@tuya-ui/components` sube a 0.1.13 con lo que la ficha necesitaba y el catálogo no tenía: `TabsTrigger` con `description`, `TabsList` con `variant="surface"`, y la hoja publicada con los anchos máximos y los alias de espaciado de DESIGN.md (los de dos palabras salen en kebab: `pb-page-bottom`). La app pasa de Inter a **IBM Plex Sans/Mono** servidas desde `@fontsource`, la fuente del sistema.
- **Orden de archivado** — este change se apoya en `redisenar-balance-de-carga`, que está implementado pero sin archivar. Sus deltas tocan la misma requirement, así que **`redisenar-balance-de-carga` debe archivarse primero**.
- **Pruebas** — `CollaboratorDashboardContainer.test.tsx` se reescribe alrededor de las pestañas; las de `DedicationAdapter` cubren el veredicto y los subtítulos.
