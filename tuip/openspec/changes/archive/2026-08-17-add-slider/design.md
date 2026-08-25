## Context

Ver proposal.md — Why. Las restricciones que dan forma al enfoque:

- El catálogo ya se apoya en Radix en nueve componentes, y `Tabs` documenta el criterio: se recurre al primitivo cuando ningún elemento nativo resuelve el patrón (foco itinerante, teclado, asociación entre partes). Varios pulgares sobre una pista es exactamente ese caso — `<input type="range">` tiene uno solo. `@radix-ui/react-slider` no está entre las nueve y habría que agregarlo, igual que cada componente Radix trajo el suyo.
- `Tag` ya definió un vocabulario de color categórico: seis tonos nombrados por su tono, sin significado de estado, pensados para distinguir miembros de un conjunto. Los tramos de una partición son ese mismo problema.
- Los datos reales de la pantalla que motiva esto guardan las bandas como rangos inclusivos con corte: XS `0–20%`, S `21–40%`. Son cuatro límites interiores, no diez números independientes.
- `SegmentedBar` recibe pesos proporcionales; un slider recibe posiciones de límite. Son modelos distintos, así que no se puede volver interactivo al primero.

## Goals / Non-Goals

**Goals:**
- Que una partición de un rango se pueda editar sin que el consumidor tenga que sostener a mano la invariante de contigüidad.
- Que el control sirva también para el caso simple de un solo valor, sin que ese caso pague el costo del complejo.

**Non-Goals:**
- No modela el dominio de las bandas de talla. El componente conoce límites sobre un rango; que sean tallas, que sumen 100 o que se muestren como `0–20 / 21–40` es de la app.
- No sustituye a `SegmentedBar`, que seguirá siendo la barra proporcional de solo lectura.
- No incluye entrada numérica acoplada al control; si una pantalla necesita escribir el valor exacto, compone un `Input` al lado.
- No agrega tokens de color nuevos.

## Decisions

- **La partición se modela como pulgares sobre una pista compartida, no como una lista de rangos.** Es la decisión central y es la que hace desaparecer el problema que originó el pedido. Con una lista de rangos `{min, max}` por banda, "si se mueve una, la otra también" es lógica que alguien tiene que escribir y mantener, y que puede fallar dejando huecos o solapes. Con un valor por límite, la interdependencia no es una regla que se aplica: es lo que un límite compartido *es*. Los estados inválidos dejan de ser representables en vez de quedar prohibidos por validación.
- **`value: number[]` con un pulgar por entrada, en vez de un componente aparte por cantidad de pulgares.** Un valor es un slider corriente, dos son un rango, cuatro son una partición de cinco tramos: el mismo control y la misma interacción, sólo cambia el largo del arreglo. Es además la forma del primitivo de Radix, así que no hay traducción intermedia. Descartado: `Slider` y `RangeSlider` separados, que duplicarían teclado y accesibilidad para una diferencia que es de datos.
- **`segments` es opcional y describe los tramos, no los define.** Los tramos ya existen: son los espacios entre pulgares, y el componente los conoce. Lo que no puede saber es cómo se llama cada uno ni de qué color va, y eso es lo único que pide. Por eso son `pulgares + 1`: los extremos también son tramos. Sin `segments` el control se ve como un slider normal, así que el caso simple no carga con la partición.
- **El color de los tramos sale del vocabulario categórico de `Tag`, extraído a un módulo compartido.** Un tramo y una etiqueta de pertenencia son el mismo problema — distinguir miembros de un conjunto sin afirmar nada sobre ellos — y conviene que la banda M sea azul tanto en su `Tag` dentro de la tabla como en su tramo dentro del editor. Que ese tipo viviera en `tag.tsx` obligaría a `Slider` a depender de `Tag` en el grafo de instalación, y quien sólo quiere un slider de volumen se llevaría un componente que no usa. Extraerlo a `lib/` deja a los dos apuntando al vocabulario y a ninguno al otro. `TagColor` queda como alias del tipo compartido, así que no se rompe nada que hoy lo importe. Descartado: duplicar la unión de seis valores en `slider.tsx`, que la dejaría libre de derivar.
- **Un arrastre mueve un solo pulgar, y eso hay que imponerlo sobre el primitivo.** Radix no se comporta igual según la entrada: con el teclado el pulgar se detiene contra el vecino, pero al arrastrar lo empuja para conservar la separación mínima. Medido sobre `20/40/60/80` con separación 5, arrastrar el primer límite hacia 51% dejaba `0–40 / 41–51 / 52–60`: se corrió una tercera banda que nadie tocó, y el mismo control respondía distinto al mouse que al teclado. Para una partición eso no sirve — arrastrar un límite tiene que significar dos tramos, siempre — así que lo que emite el primitivo se reduce a un único pulgar movido, acotado contra donde ya estaban sus vecinos. Se identifica cuál conduce por la dirección: al empujar a la derecha suben varios y el de más a la izquierda es el del cursor; al empujar a la izquierda bajan y es el de más a la derecha. Descartado: dejar el empuje y documentarlo, que habría dejado la cascada y la inconsistencia entre mouse y teclado.
- **La separación mínima se expresa en la unidad del rango, no en píxeles.** Lo que hay que evitar es un tramo sin sentido — una banda de 0% —, y eso es una condición sobre los datos, no sobre el tamaño en pantalla. En píxeles el mismo control admitiría o no una banda según el ancho del contenedor.
- **Cada pulgar recibe su propio nombre accesible del consumidor.** El componente sabe que hay cuatro pulgares, no que el segundo es "el límite entre S y M". Sin ese nombre, una tecnología de asistencia anuncia cuatro controles indistinguibles con un número cada uno.

## Risks / Trade-offs

- [Arrastrar es impreciso para fijar un número exacto, y las bandas son porcentajes que alguien puede querer clavar en 20] → Mitigado por el teclado, que mueve de a un paso y está en el requisito, no como extra. Si una pantalla necesita además escritura directa, compone un `Input`; acoplarlo al control lo volvería un widget compuesto con dos fuentes de verdad.
- [`segments` obliga a mantener `pulgares + 1` en el consumidor, y equivocarse produce una partición mal pintada] → Es una relación que el tipo puede expresar sólo parcialmente en TypeScript; la documentación la enuncia y el ejemplo la muestra. Se prefiere eso a que el componente reciba los tramos y derive los pulgares, que invertiría cuál es la fuente de verdad.
- [Extraer `TagColor` toca un componente recién archivado] → El alias mantiene la API pública igual y ningún requisito de `Tag` cambia, así que es refactor, no cambio de comportamiento. Se registra acá para que quede el rastro de por qué se movió.
- [Agregar `@radix-ui/react-slider` suma una dependencia más al paquete] → Consistente con los nueve casos anteriores; la alternativa, escribir a mano arrastre, teclado, foco itinerante y no-cruce, es justamente lo que el criterio de `Tabs` descarta.
