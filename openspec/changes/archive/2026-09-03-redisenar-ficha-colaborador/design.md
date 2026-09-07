# Diseño — Rediseñar la ficha del colaborador

## Contexto

- **La entrada es un boceto, no una descripción.** El usuario pidió implementarlo *tal cual*, así que el boceto manda en composición, jerarquía y redacción. Se leyó su código fuente completo —no sólo la captura—, incluida la lógica que calcula qué muestra cada zona.
- **Decisiones ya tomadas con el usuario:** la señal de subasignación **conserva** su nombre (*Posible subasignación*, no "Margen disponible" como dice el boceto), porque el listado, el indicador, el badge del sidebar y el contrato la nombran así; **"Foco"** gana sobre "Multitarea" en las dos pantallas; y la anotación de contexto de célula **sale de la ficha**, porque el boceto no le reserva lugar y se implementa tal cual.
- **Este change se apoya en `redisenar-balance-de-carga`**, que está implementado (28/28) pero sin archivar. Las dos tocan la requirement del dashboard, así que el delta de aquí está escrito sobre el estado que deja aquella, y el orden de archivado importa.
- Todo lo que el boceto muestra ya lo responde el mock: no hay DTO, endpoint ni parámetro nuevo.

## Objetivos / No objetivos

**Objetivos**

- Que la **respuesta se lea al abrir** y la evidencia se busque sólo cuando hace falta.
- Que la ficha y el listado usen **un solo vocabulario**: cuatro señales, tolerancia, horas, HUs y foco.
- Que el sprint se cambie con **el mismo navegador** en las dos pantallas.
- Que la evidencia se lea **con su veredicto en palabras**, no obligando a comparar una cifra contra un umbral mentalmente.

**No objetivos**

- Cambiar la **regla**: los umbrales, la agregación por concurrencia y el mínimo de evidencias quedan intactos.
- Tocar el contrato ni el mock.
- Rediseñar el listado otra vez.

## Decisiones

- **La cabecera se desbalancea a propósito.** Tres tarjetas de 2fr/1fr/1fr en vez de cuatro iguales. Una cuadrícula de cuatro tarjetas idénticas dice que las cuatro importan lo mismo, y no es cierto: la señal es la respuesta y la mediana histórica es un insumo. El ancho doble, el borde en el rol de la señal y el titular hacen que la respuesta se lea antes que cualquier cifra. *Alternativa:* mantener las cuatro y sólo destacar la de balance con color — descartada: el color se pierde entre las barras de las otras tres, que ya usan color.
- **La tarjeta de Referencia se retira, no se pierde.** Sus tres cifras pasan a la columna derecha de la pestaña *Señales*, donde ya estaban como panel y donde se leen mejor: tres barras a la misma escala hacen evidente si se separó la persona o cayó la célula entera, cosa que una sola mediana en una tarjeta no puede decir.
- **La línea de resumen en lenguaje natural se retira.** Repetía en prosa lo que la cabecera ya dice en cifras, y con el balance al frente esa función la cumple la frase de la señal. *Alternativa:* conservarla bajo las tarjetas — descartada: dos frases explicativas seguidas compiten entre sí.
- **Los paneles pasan a pestañas, y las pestañas llevan subtítulo.** Nueve paneles apilados obligan a recorrer la página para saber si hay algo. Cuatro pestañas con su resumen ("3 de 6 hacia sobrecarga", "6 historias · 30 SP") dan el índice sin abrir ninguna: el lead decide si entra. *Alternativa:* acordeones — descartada: dejan volver a la misma pila si se abren todos, y no dan el resumen en el encabezado.
- **El veredicto se escribe en palabras, la tolerancia queda al lado.** El boceto convierte cada evidencia en una fila de *Señal · Valor · Tolerancia* con su veredicto ("Fuera de tolerancia · desviación fuerte"). Es mejor que lo actual, que muestra "Cuenta hacia sobrecarga · Umbral 25 %" y deja la comparación al lector.
- **Los umbrales del boceto son de mentira; los nuestros se quedan.** El boceto escribe tolerancias absolutas —"Mínimo 80 %" de cumplimiento, "Hasta 15 %" de carry-over—; nuestro modelo las mide **relativas al histórico del propio colaborador** (una caída de 15 pp, un exceso de 10 pp). Se toma la **forma** del boceto —la columna de Tolerancia y el veredicto— y se conservan los umbrales del modelo, que ya se rotulan solos. Cambiar la regla no es un cambio de presentación y nadie lo pidió.
- **El navegador de sprint sube al breadcrumb y la tira de pestañas de sprints se retira.** Con siete sprints la tira ocupa un renglón entero y crece con la ventana de histórico; el navegador ocupa lo mismo siempre y es el que el lead ya aprendió en el listado. La navegación por salto —ir directo a S14— la cubre la pestaña *Tendencia*, donde cada fila es accionable y además muestra por qué querría uno saltar ahí.
- **La tendencia se invierte a más reciente primero.** Es el orden del boceto y el que sirve para leer una ficha: se entra por el sprint de ahora. En el listado no aplica porque ahí no hay tendencia.
- **La anotación de contexto de célula sale de la ficha.** Decisión del usuario, y el boceto no le da lugar. La **regla no cambia** —la célula sigue sin atenuar la señal— y la lectura sobrevive en el tooltip de la fila del listado. Queda anotado como pérdida deliberada, no como olvido.
- **"Foco" reemplaza a "Multitarea" en todo rótulo visible**, incluido `EVIDENCE_LABELS.multitasking`. El campo del contrato sigue siendo `wip` y la clave de la evidencia sigue siendo `multitasking`: los nombres internos rastrean el origen del dato, los visibles hablan el idioma del lead.
- **Las brechas con tuip se cierran en tuip, no con clases sueltas.** El boceto pedía tres cosas que el catálogo no tenía: una pestaña con **descripción** bajo la etiqueta, una lista de pestañas que **encabece una card** (sobre la superficie sutilísima, con el relleno de la card), y el **vocabulario de maquetación** que DESIGN.md documenta pero la hoja publicada no traía (`max-w-prose`/`max-w-page`, `gap-group`, `pb-page-bottom`…). Las tres entraron a `@tuya-ui/components` 0.1.13 —`TabsTrigger description`, `TabsList variant="surface"`, y los alias en la hoja— con su prueba, su ejemplo en docs y su changeset, y la ficha las consume. *Alternativa:* forzarlo con `className` desde la app — descartada: `cn` concatena y no fusiona, así que el `gap-7` propio de la lista seguía mandando, y el resultado dependía del orden de dos hojas.
- **La app rinde en la fuente del sistema.** Cargaba Inter desde Google Fonts —la familia que DESIGN.md descarta— y por eso ninguna pantalla se parecía al catálogo ni al boceto. Pasa a IBM Plex Sans y Mono servidas desde `@fontsource` (los cuatro pesos de la escala, incluido el bold de `metric`), y `body` toma `--font-sans` de tuip. Es un cambio de toda la app, no de la ficha, y se hizo a propósito: una sola fuente para el shell y para los componentes.
- **Ningún gráfico va en rojo Tuya.** La barra de capacidad se rellenaba en `brand`, y la del sprint actual de la referencia también. DESIGN.md reserva ese rojo a la acción primaria, la navegación activa y el foco; los rellenos pasan a grafito, y sólo el sprint actual toma el rol de la señal cuando la hay.
- **El formato sigue viviendo en el adapter.** Los subtítulos de las pestañas, los veredictos y las métricas secundarias se derivan en `DedicationAdapter`, no en los componentes: es la regla de la casa y es lo que permite probarlos sin montar React.

## Riesgos / Compromisos

- **[Cuatro pestañas esconden evidencia que antes estaba a la vista]** → Alguien que hoy hace scroll para ver las historias tendrá que abrir una pestaña. Se mitiga con los subtítulos, que dicen qué hay dentro, y porque *Señales* —lo que sostiene la señal— abre por defecto.
- **[La ficha deja de decir cuándo la célula entera se comporta igual]** → Un lead podría conversar con la persona cuando el problema es del equipo. Se mitiga porque el listado sí lo dice en el tooltip de la fila, que es donde se detectan los casos, y porque la señal misma no cambió. Si molesta en uso, vuelve como una línea al pie de la tarjeta de Balance.
- **[Dos changes activos sobre la misma requirement]** → Archivar en el orden equivocado revierte el trabajo del anterior. Se mitiga con la nota explícita de orden en el proposal y con la verificación de la tarea final.
- **[La tira de sprints desaparece y con ella la vista de conjunto]** → Ya no se ven de un vistazo los siete sprints con su procedencia. Se mitiga con la pestaña *Tendencia*, que muestra los mismos siete con más información y permite saltar.

## Plan de migración

1. **Adapter primero.** `SelectedSprintView` gana el veredicto por evidencia, los cuatro subtítulos de pestaña y las métricas secundarias formateadas; `EVIDENCE_LABELS.multitasking` pasa a "Foco". Aquí se ven los cambios de contenido sin tocar todavía la composición.
2. **Piezas de la cabecera.** La tarjeta de Balance grande, las dos de cifras y la fila de cuatro métricas, cada una con su prueba.
3. **La tarjeta de pestañas.** Los ocho paneles actuales pierden su marco y pasan a ser el contenido de las cuatro pestañas, reagrupados como el boceto los agrupa.
4. **El navegador al breadcrumb**, y `SprintTabs` se retira.
5. **Contenedor y pruebas**: se recompone la página y se reescribe su prueba alrededor de las pestañas.
6. **Cierre**: barrido de vocabulario, documentación y la puerta completa contra el boceto.

No hay migración de datos ni de contrato: la ficha lee lo mismo que hoy.
