import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const tagContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para marcar a qué miembro de un conjunto pertenece un elemento — una talla, una categoría, un tramo — cuando el color ayuda a agruparlos de un vistazo.",
      "Dentro de una celda de tabla, donde una columna repite un valor de un conjunto cerrado y conviene distinguirlo sin leerlo entero.",
    ],
    whenNotToUse: [
      "Para comunicar un estado — sincronizado, con error, en progreso: eso es un Badge, que además lo anuncia como tal a las tecnologías de asistencia.",
      "Como filtro que se pueda quitar: eso es un Chip, que sí es interactivo y expone su control de remover.",
      "Como botón o enlace: Tag no es interactivo ni recibe foco.",
    ],
    pairs: [
      {
        do: "Usar Badge cuando la etiqueta dice en qué estado está el elemento, y Tag cuando solo dice a qué grupo pertenece.",
        dont: "Usar Tag para un estado porque el relleno sólido resalta más.",
        why: "Badge se anuncia como estado y su color significa algo; el de Tag no significa nada. Intercambiarlos hace que el color prometa una severidad que nadie quiso afirmar.",
      },
      {
        do: "Fijar un color por miembro del conjunto y mantenerlo estable en todas las pantallas.",
        dont: "Elegir el color por lo que se ve mejor en cada tabla.",
        why: "El color se aprende una vez por conjunto; si el mismo valor cambia de color entre pantallas deja de servir para agrupar y hay que volver a leer cada etiqueta.",
      },
      {
        do: "Dejar que el texto identifique al elemento por completo.",
        dont: "Acortar la etiqueta confiando en que el color la distinga.",
        why: "El color es refuerzo, no información: quien no lo distingue —o quien ve el conjunto en escala de grises— se queda solo con el texto.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <>
        <Tag color="gray">XS</Tag>
        <Tag color="green">S</Tag>
        <Tag color="blue">M</Tag>
        <Tag color="amber">L</Tag>
        <Tag color="red">XL</Tag>
        <Tag color="purple">Otro</Tag>
      </>
    ),
    partsCaption: "color: gray · green · blue · amber · red · purple — seis colores sin significado propio",
    partsDescription:
      "La prop se llama por tono (`color=\"red\"`) y no por rol semántico (`variant=\"danger\"`) justamente porque el color no significa nada: pedir el rojo no debería obligar a afirmar que el elemento es peligroso. Cada tono resuelve internamente a una escala del sistema, así que la paleta sigue teniendo una sola fuente sin que el vocabulario del consumidor cargue significado.",
    parts: [
      {
        name: "Radio",
        measure: "radius.pill",
        note: "Píldora, no cuadrado: junto con el peso bold y la ausencia de punto, es lo que lo distingue de Badge, ya que ambos comparten el mismo tinte de fondo.",
      },
      {
        name: "Ancho mínimo",
        measure: "min-w-10, contenido centrado",
        note: "Hace que un conjunto de etiquetas cortas mida lo mismo: sin él, «XS» y «L» caen como píldoras de distinto tamaño en la misma columna. Una etiqueta más larga crece por encima del mínimo en vez de recortarse.",
      },
      {
        name: "Padding",
        measure: "px-2.5 py-0.5",
        note: "Más bajo que el de Badge: la etiqueta suele ser de una o dos letras y no debe alterar la altura de la fila que acompaña.",
      },
      {
        name: "Par de color",
        measure: "bg-*-subtle + text-*-default",
        note: "El tinte del paso 100 bajo el texto del 800. El paso 600 intermedio no se expone como color de texto —solo como borde e ícono— y sobre el tinte mide 3.28:1 en `warning`, por debajo del mínimo que el sistema verifica. Nunca la familia `brand`, reservada a la acción primaria de la vista.",
      },
      {
        name: "Texto",
        measure: "text-body-sm font-bold",
        note: "Bold: es lo que, junto con la forma de píldora, separa a Tag de Badge ahora que ambos comparten el mismo tinte de fondo.",
      },
      {
        name: "Punto",
        measure: "—",
        note: "No tiene. El punto de Badge señala un estado; acá no hay estado que señalar.",
      },
    ],
    renderState: (state) => {
      if (state.name === "Junto a un Badge") {
        return (
          <>
            <Tag color="blue">M</Tag>
            <Badge variant="success">Sincronizado</Badge>
          </>
        );
      }
      if (state.name === "En una tabla") {
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Talla</TableHead>
                <TableHead>Lectura</TableHead>
                <TableHead align="right">Persona-mes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Tag color="gray">XS</Tag>
                </TableCell>
                <TableCell>Cambio menor</TableCell>
                <TableCell align="right">0,5 – 1,0</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Tag color="blue">M</Tag>
                </TableCell>
                <TableCell>Iniciativa media</TableCell>
                <TableCell align="right">3,0 – 6,0</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        );
      }
      return <Tag color="blue">M</Tag>;
    },
    states: [
      { name: "Suelto", note: "Un Tag por sí solo: no tiene estados de interacción — no es interactivo ni recibe foco." },
      {
        name: "Junto a un Badge",
        note: "La forma es lo que los separa: píldora sólida para pertenencia, cuadrado tenue con punto para estado.",
      },
      { name: "En una tabla", note: "El uso que motivó el componente: una columna de valores de un conjunto cerrado." },
    ],
    statesCaption: "Tag no tiene estados propios; lo que cambia es con qué convive",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: "<span> sin rol",
      explanation:
        "Se lee como el texto que contiene. A diferencia de Badge, no lleva `role=\"status\"`: una talla no es un estado que cambie, y anunciarla como región en vivo interrumpiría sin motivo.",
    },
    {
      aspect: "El color no informa",
      value: "Texto siempre presente",
      explanation:
        "No existe una forma solo-color del componente. La etiqueta identifica al elemento por completo, así que el color queda como refuerzo redundante y nadie depende de distinguirlo.",
    },
    {
      aspect: "Contraste del texto",
      value: "text-*-default sobre bg-*-subtle",
      explanation:
        "Cada tono usa el color de texto que el sistema derivó para ese tinte, en vez de un valor fijo — el par supera 4.5:1 en los seis (7.06:1 en el peor caso, `amber`) y lo verifica el mismo chequeo automático que cubre al resto de los tokens.",
    },
    {
      aspect: "Foco",
      value: "No focusable",
      explanation:
        "Tag no es interactivo y no entra en el orden de tabulación; si algo tiene que poder activarse o quitarse, el componente correcto es Chip o Button.",
    },
  ],
};
