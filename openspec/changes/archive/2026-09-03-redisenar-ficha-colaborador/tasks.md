# Tareas — Rediseñar la ficha del colaborador

> Cada grupo cierra en verde antes de pasar al siguiente: `npx tsc --noEmit` y las
> pruebas que la tarea nombra. `tsc` es la herramienta principal acá: cambiar la
> forma de `SelectedSprintView` enumera solo cada superficie por actualizar. La
> puerta de árbol limpio —lint, prettier y la suite entera— es la 6.4.

## 1. Vocabulario y derivaciones del adapter

- [x] 1.1 En `adapters/balanceSignal.ts`: `EVIDENCE_LABELS.multitasking` pasa de "Multitarea" a "Foco". Verificar con `npx vitest run src/features/dedication/adapters` y con `grep -rn "Multitarea" src/features src/mocks`, que sólo debe devolver el panel y las pruebas que los grupos 3 y 4 reescriben.
- [x] 1.2 En `adapters/DedicationAdapter.ts`: `EvidenceRow` gana un **veredicto en palabras** —"Fuera de tolerancia", "Fuera de tolerancia · desviación fuerte", "Dentro de la tolerancia", "No se pudo evaluar: <motivo>"— derivado de la dirección, de `strong` y del motivo de no evaluable, en vez del actual "Cuenta hacia sobrecarga". Verificar con pruebas nuevas del adapter: una evidencia fuera de tolerancia con desviación fuerte, una dentro, y una no evaluable de sprint en curso.
- [x] 1.3 En `adapters/DedicationAdapter.ts`: `SelectedSprintView` gana las **cuatro métricas secundarias** ya formateadas —cumplimiento ("40 %" · "12 de 30 SP en Closed"), trabajo no planificado ("36.4 %" · "+8 SP sobre 22"), carry-over ("0 %" · "0 SP") y foco ("2" · "iniciativas · 4 HUs abiertas a la vez")— cada una con su cifra, su lectura y el rol de color cuando se sale de su tolerancia. Verificar con la prueba del adapter que arma la vista del sprint en curso de Carlos y compara las cuatro.
- [x] 1.4 En `adapters/DedicationAdapter.ts`: **`CollaboratorDetail`** (no `SelectedSprintView`: el subtítulo de la tendencia habla de todos los sprints, no del elegido) gana los **cuatro subtítulos de pestaña** ("3 de 6 hacia sobrecarga", "6 historias · 30 SP", "5 días activos · 24 commits", "7 sprints · +0.4 %"), derivados de las evidencias que cuentan, de las historias, de la actividad y de la tendencia. Verificar con la prueba del adapter que los cuatro salen del mismo detalle.

## 2. La cabecera

- [x] 2.1 Crear `components/BalanceSprintCard.tsx`: la tarjeta grande con el punto de color, el nombre de la señal en tipografía de titular, su frase, cuántas señales la sostienen y, al pie, la procedencia del sprint. El borde toma el rol de la señal sólo cuando pide una decisión de carga. Verificar con pruebas del componente: sobreasignación con borde en peligro y "3 señales"; carga habitual sin borde de color; no evaluable con su motivo y el aviso de sprints que faltan.
- [x] 2.2 Reescribir `components/BalanceHeaderCards.tsx` como la fila de tres tarjetas 2fr/1fr/1fr —Balance, Capacidad y Demanda vs referencia—, **sin la tarjeta de Referencia y sin la línea de resumen**. Verificar con sus pruebas: las tres tarjetas con sus cifras, y que "Referencia" ya no aparece como tarjeta.
- [x] 2.3 Crear `components/SprintMetricsRow.tsx`: las cuatro métricas secundarias con su rótulo, su cifra grande y su lectura al lado, la cuarta rotulada **Foco**. Verificar con pruebas del componente, incluidas las cifras que se salen de tolerancia y toman su rol de color.

## 3. La tarjeta de pestañas

- [x] 3.1 Crear `components/DashboardTabs.tsx`: la tarjeta con las cuatro pestañas y su subtítulo, la activa marcada con la regla en rol de marca, y con `role="tab"` accesible. Verificar con pruebas del componente, incluidas las cuatro etiquetas con su subtítulo y el cambio de pestaña con `fireEvent.mouseDown` (que es lo que responde en tuip).
- [x] 3.2 Convertir `WhyThisSignalPanel` y `EvidenceList` en el contenido de la pestaña **Señales**: la tabla de Señal · Valor · Tolerancia con el veredicto de cada evidencia, y a la derecha `ReferencePanel` (tres barras) y `UnplannedWorkPanel` como barra apilada con su leyenda y sus tres totales. Los tres pierden su marco de panel. Verificar con las pruebas de esos componentes actualizadas: las seis filas, el veredicto de una fuerte, el de una no evaluable, y las tres barras de referencia.
- [x] 3.3 Convertir `SprintStoriesPanel` en el contenido de la pestaña **Historias**, con el pie de recuento —historias y SP, SP en Closed, SP sin cerrar, cómo se calcula el cumplimiento y cuántas entraron después—. Verificar con sus pruebas: una fila con su marca de estado, una con "Entró después", y el pie completo.
- [x] 3.4 Convertir `ActivityCalendarPanel` en el contenido de la pestaña **Actividad**, con el mapa a la izquierda y los totales por tipo y la última actividad a la derecha. Verificar con sus pruebas actualizadas.
- [x] 3.5 Convertir `TrendPanel` en el contenido de la pestaña **Tendencia**, ordenado **del más reciente al más antiguo**, con cada fila accionable para ir a ese sprint y la del elegido marcada. Verificar con sus pruebas: el orden invertido, que elegir una fila publica ese sprint, y que la fila del sprint elegido está marcada.
- [x] 3.6 Retirar `SprintExecutionPanel` y `MultitaskingPanel` como paneles propios: sus cifras viven ahora en las métricas secundarias y en la pestaña *Señales*. Verificar con `tsc` sin referencias colgadas y con `grep -rn "SprintExecutionPanel\|MultitaskingPanel" src/`, que no debe devolver nada.

## 4. Navegador de sprint y encabezado

- [x] 4.1 Publicar en la franja del breadcrumb el `SprintNavigator` del listado —con `previousName`/`nextName` derivados de la lista de sprints del detalle—, la marca de estado del sprint (*En curso* / *Finalizado*) y las tres acciones. Verificar con la prueba del contenedor: la flecha anterior mueve la ficha entera al sprint previo y el sprint queda en la URL.
- [x] 4.2 Retirar `components/SprintTabs.tsx` y su uso. Verificar con `tsc` y con `grep -rn "SprintTabs" src/` sin resultados.
- [x] 4.3 Compactar `CollaboratorHeader` a la línea de identidad del boceto: avatar, nombre, y debajo cargo · célula · dedicación declarada · las iniciativas del sprint como marcas con su "+N" con los nombres en el tooltip. Verificar con sus pruebas: la línea completa, y un colaborador con tres iniciativas que muestra una marca y "+2".

## 5. El contenedor

- [x] 5.1 Recomponer `CollaboratorDashboardContainer`: franja del breadcrumb, línea de identidad, cabecera de tres tarjetas, fila de cuatro métricas y la tarjeta de pestañas abierta en *Señales*. Verificar con la prueba del contenedor reescrita: las tres tarjetas, las cuatro métricas, las cuatro pestañas con su subtítulo, y que ninguna cadena dice "Multitarea".
- [x] 5.2 Verificar los estados que no son el feliz, con las pruebas del contenedor: sin identidad DevOps (estado vacío, sin navegador ni pestañas), sin sprints, histórico insuficiente (Balance dice "No evaluable" con cuántos faltan y las pestañas muestran lo medible) y sprint sin snapshot (el pie del balance lo dice y las evidencias de cumplimiento y carry-over no se evalúan).

## 6. Documentación y cierre

- [x] 6.1 Actualizar `context/docs/Roles_y_Permisos_Plataforma.md` donde describe la ficha: cabecera con el balance al frente, cuatro pestañas y "Foco". Verificar leyendo el doc: no queda ninguna mención a la ficha como paneles apilados ni a "Multitarea" como rótulo.
- [x] 6.2 Barrido de vocabulario: `grep -rni "multitarea" src/features src/mocks context` sólo devuelve nombres internos (`multitasking`, `MULTITASKING_*`) y los comentarios que explican el origen del dato. Verificar con el grep y con `uiWriting.test.ts` en verde.
- [x] 6.3 Verificar el **orden de archivado**: `openspec list` muestra `redisenar-balance-de-carga` todavía activo, y este change no puede archivarse antes que aquel. Dejarlo dicho en el resumen de cierre.
- [x] 6.4 Correr `tsc`, lint, prettier y la suite completa, y verificar en `pnpm dev:mock` contra el boceto: la cabecera de tres tarjetas con el balance al frente, las cuatro métricas, las cuatro pestañas con su subtítulo, la tabla de señales con sus veredictos y tolerancias, la barra apilada de no planificado, el navegador de sprint en el breadcrumb moviendo la ficha entera, y una fila de la tendencia llevando a su sprint.
