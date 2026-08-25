## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **La causa del filtro está localizada.** `SquadsList` empieza con `if (loading) return <p>Cargando células…</p>`, y `useSquads` pone `loading` en `true` en cada cambio de página, búsqueda o filtro. El early return se lleva puesta la barra de controles junto con la tabla. Se comprobó además que `FilterButton` **no** tiene el defecto: en aislamiento conserva su panel abierto al marcar una opción.
- **Los colores de BAU y Transformación tienen una sola definición**, `MIX_TONES`, pero vive dentro de `SquadTeamStatsCards` y la importan de ahí ocho archivos de cuatro features. (Al proponer se dijo que estaban duplicados en dos componentes; no era así.)
- **El vocabulario categórico del sistema tiene seis tonos** —gris, verde, azul, ámbar, rojo y púrpura— y es el que ya usan `Tag` y `Avatar`.
- **El microcopy son 56 ocurrencias en 27 archivos**, ninguna con lógica alrededor. Tres son diálogos de borrado que comparten estructura. La cifra de doce que se dio al proponer salía de un patrón de búsqueda con un límite de palabra que no cierra tras vocal acentuada.
- Este change depende de que tuip publique el badge sin punto y las partes de `CapacityBar` con color categórico.

## Goals / Non-Goals

**Goals:**

- Que el filtro se pueda usar como un filtro de selección múltiple.
- Que BAU y Transformación dejen de parecerse a la escala de seniority.

**Non-Goals:**

- Rediseñar el formulario más allá del campo de descripción.
- Introducir un sistema de traducción o de cadenas centralizadas: el problema es de registro, no de infraestructura.
- Tocar la lógica de búsqueda, filtrado o paginación.

## Decisions

- **El estado de carga baja a la zona de resultados en vez de reemplazar la pantalla.** Es el arreglo de fondo: la barra de controles deja de estar dentro de lo que el early return descarta. Alternativa considerada: controlar el `open` del `FilterButton` desde la pantalla para reabrirlo tras la recarga — se descarta porque trata el síntoma y deja el otro efecto intacto, que es la búsqueda perdiendo el foco a media palabra.
- **Los colores de la mezcla se mudan a un módulo propio.** No estaban duplicados, pero vivían dentro de un componente de tarjetas del que ocho archivos —de Células, Torre de Control y Personas— importaban una constante de color. Con el vocabulario cambiando de familia, el lugar donde vive tiene que decir de qué se trata.
- **BAU en verde y Transformación en púrpura, a confirmar en pantalla.** El criterio de exclusión pesa más que el de elección: quedan fuera azul y púrpura-azulado por parecerse a la escala de seniority —que es lo que motivó el cambio—, rojo por leerse como peligro, y gris porque es el color del track vacío de la propia barra. Verde y púrpura son los dos que quedan bien separados entre sí y de todo lo demás. El par es una decisión visual, así que la tarea de verificación pide mirarlo **junto a** la escala de seniority antes de darlo por bueno.
- **El registro se corrige en toda la app de una vez.** Hacerlo por pantallas deja dos diálogos de borrado idénticos con redacciones distintas, a un clic uno del otro; y el requisito de `ui-writing` que este change agrega pide justamente lo contrario.
- **Las tres confirmaciones de borrado comparten redacción.** Son la misma acción sobre objetos distintos: una sola forma sirve para las tres, y es lo que hace verificable el requisito de que la misma acción se diga igual en todas partes.
- **`ui-writing` es una capability propia y no un requisito dentro de `squads`.** La voz del producto no es de ninguna pantalla; metida en `squads` no la encontraría quien escribe una cadena en Personas, que es exactamente cuando hace falta.

## Risks / Trade-offs

- **[Verde puede leerse como "bien" y no como "BAU"]** → El vocabulario categórico se documenta como mudo sobre el estado, igual que el de acento, y es el mismo verde que un `Tag` usa sin significar nada. Aun así es un riesgo de percepción, y por eso la verificación es mirarlo en pantalla y no darlo por bueno desde el token.

  Verificado en el detalle de una persona, que es donde conviven de verdad la
  escala de seniority y la mezcla. El verde resuelve el problema por completo:
  `#116B4B` no se parece a ningún paso de la escala, y BAU —que antes era
  celeste, indistinguible de "Principiante"— deja de leerse como un nivel. El
  verde tampoco se lee como "está bien": la leyenda dice "BAU" al lado.

  Lo que **no** queda resuelto del todo es el otro tramo: el púrpura de
  Transformación (`#5B3FC4`) y el violeta de "Avanzado" (`#7C3AED`) son de la
  misma familia. Se distinguen porque las piezas tienen formas distintas —un
  medidor de segmentos contra una barra apilada— y porque el par ya no se lee
  como dos pasos consecutivos de nada, pero el parecido de matiz está. De los
  seis tonos categóricos no hay ninguno libre de objeción: azul es el paso
  "Competente", gris es la pista vacía de la propia barra, rojo lee como
  peligro. El único que quedaría fuera de la escala es `amber`, al precio de
  parecerse al rol de advertencia. Queda anotado como decisión abierta.
- **[Un barrido de texto es fácil de dejar a medias, y de creer terminado]** → Pasó dos veces durante la implementación: el primer conteo dio doce ocurrencias, el segundo 56, y un tercer barrido encontró 24 más que ninguno de los dos había buscado. Por eso la verificación no es una lista escrita a mano sino una prueba que recorre el código y falla con lo que encuentre.
- **[Depende de dos cambios de tuip]** → Primera tarea del apply, con la comprobación explícita: ya pasó una vez que el dev server sirviera el paquete anterior.

## Migration Plan

1. Requisito previo: tuip reinstalado con el badge sin punto y `CapacityBar` categórica.
2. El estado de carga baja a la zona de resultados.
3. Los colores de la mezcla: un solo lugar, vocabulario categórico.
4. La descripción, a campo multilínea.
5. La criticidad, sin punto.
6. El registro del lenguaje, en toda la app.
7. Pruebas y verificación en pantalla.

Rollback: los seis son independientes entre sí; volver atrás cualquiera no afecta a los demás.
