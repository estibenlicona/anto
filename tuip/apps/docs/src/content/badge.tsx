import { Badge } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const badgeContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para etiquetar el estado de un elemento dentro de una lista o una tabla: sincronizado, en progreso, con error.",
      "Para señalar que una sugerencia viene de una fuente automática (IA), con la variante `discovery`.",
      "Con `dot={false}` cuando lo que el badge lleva no es un estado sino una clasificación fija —el nivel de una escala, la criticidad de algo—. El punto marca que algo está pasando y puede dejar de pasar; sobre una clasificación no dice nada y compite con la etiqueta que ya la da.",
    ],
    whenNotToUse: [
      "Como botón o enlace: el badge no es interactivo ni recibe foco.",
      "Para clasificar por pertenencia (un lenguaje, una categoría) sin que haya un estado detrás: eso es un Tag, no un Badge — se distinguen también por forma, píldora en vez de cuadrada.",
    ],
    pairs: [
      {
        do: "Acompañar el punto de color con texto que nombre el estado.",
        dont: "Usar solo el punto para distinguir un estado de otro.",
        why: "El color por sí solo excluye a quienes no lo distinguen y no se transmite por lector de pantalla; el texto es lo que hace la información accesible a todos.",
      },
      {
        do: "Quitar el punto cuando el badge clasifica en vez de decir un estado.",
        dont: "Quitarlo porque la fila se ve más limpia.",
        why: "La pregunta no es estética sino de contenido: ¿esto es una condición que puede cambiar, o una clasificación fija? Si es lo primero, el punto es la marca de que algo está pasando. Si se quita por gusto, dos badges que dicen lo mismo terminan con tratamientos distintos según quién los escribió.",
      },
      {
        do: "Mantener el mismo mapeo de variante y significado en todo el producto.",
        dont: "Usar la variante de peligro para un estado que no es un error, solo porque destaca más.",
        why: "Las variantes se aprenden una vez y se aplican en todas partes; romper esa correspondencia obliga a releer el significado en cada pantalla.",
      },
      {
        do: "Dejar `neutral` para un estado que todavía no arrancó, como \"Sin iniciar\".",
        dont: "Usar el rol `brand` para destacar un badge por sobre los demás.",
        why: "El color de marca señala la acción primaria de la vista; si aparece en un badge, una fila entera se lee como si fuera accionable.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <>
        <Badge variant="success">Sincronizado</Badge>
        <Badge variant="info">En progreso</Badge>
        <Badge variant="warning">Al límite</Badge>
        <Badge variant="danger">Error</Badge>
        <Badge variant="neutral">Sin iniciar</Badge>
        <Badge variant="discovery">Sugerido por IA</Badge>
      </>
    ),
    partsCaption: "variant: success · info · warning · danger · neutral · discovery — cada una con su punto y su par de fondo y texto",
    partsDescription:
      "El badge es punto y texto en una sola pieza. Cada variante toma el fondo del paso `subtle` de su familia semántica, el texto del paso `800` (`-default`) de esa misma familia, y el punto de un paso más saturado — el `600` (`-bold`) — de modo que el punto se lee un tono más intenso que el texto que lo acompaña, igual que en la definición de diseño.",
    parts: [
      {
        name: "Punto",
        measure: "h-1.5 w-1.5, rounded-pill",
        note: "Parte no textual (`aria-hidden`) — el significado lo lleva el texto, el punto solo lo refuerza visualmente.",
      },
      {
        name: "Padding",
        measure: "px-2.5 py-1",
        note: "Deliberadamente asimétrico: el badge acompaña una línea de texto y no debe alterar su altura.",
      },
      {
        name: "Radio",
        measure: "radius.control",
        note: "Cuadrado, no píldora: lo distingue de Chip, que sí es completamente redondeado porque comunica pertenencia en vez de estado.",
      },
      {
        name: "Texto",
        measure: "text-body-sm font-medium",
        note: "Un paso por debajo del texto de interfaz, para que la etiqueta no compita con el contenido que rotula.",
      },
      {
        name: "Par de color",
        measure: "bg-*-subtle + text-*-default + bg-*-bold (punto)",
        note: "Nunca la familia `brand` — reservada para la acción primaria de la vista, no para un estado.",
      },
    ],
    renderState: (state) => (
      <Badge variant="success" className={state.className}>
        Sincronizado
      </Badge>
    ),
    states: [
      {
        name: "Único estado",
        note: "El badge no es interactivo: no tiene hover, foco ni deshabilitado. Su apariencia solo cambia con la variante.",
      },
    ],
    statesCaption: "Badge no tiene estados de interacción — lo que varía es la variante semántica, no el estado del propio control",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: '<span role="status">',
      explanation:
        "Región viva discreta: un cambio de estado se anuncia cuando la persona termina lo que está haciendo, sin robar el foco.",
    },
    {
      aspect: "Punto",
      value: 'aria-hidden="true"',
      explanation:
        "Es decorativo: repite en color lo que el texto ya dice. Ocultarlo evita que un lector de pantalla anuncie un elemento sin nombre.",
    },
    {
      aspect: "Teclado",
      value: "no participa",
      explanation:
        "No es interactivo, así que no recibe foco ni entra en el orden de tabulación. Si necesitas que se pueda accionar, es un botón, no un badge.",
    },
    {
      aspect: "Color",
      value: "no es el único canal",
      explanation:
        "El texto nombra el estado: el punto y el color de fondo acompañan, pero la información sigue completa sin ellos.",
    },
    {
      aspect: "Contraste",
      value: "par subtle / default",
      explanation:
        "Fondo y texto salen de la misma familia semántica, cuyo par está verificado en `semantic-colors.ts`; mezclar familias a mano rompe esa garantía.",
    },
    {
      aspect: "Uso en volumen",
      value: "evitar remontar",
      explanation:
        "Al ser `role=\"status\"`, montar y desmontar muchos badges a la vez genera anuncios repetidos; conviene actualizar el texto en vez de reemplazar el nodo.",
    },
  ],
};
