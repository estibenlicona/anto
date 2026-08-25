import { SeniorityCard } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const seniorityCardContent: ComponentContent = {
  usage: {
    whenToUse: [
      "En una columna de listado donde el nivel de una persona se compara con el de las demás — con `density=\"compact\"`, que es la densidad de una fila de tabla.",
      "En la ficha o el encabezado de una persona, donde el nivel es uno de sus datos principales.",
      "Con `hideLabel`, cuando el espacio no da para la etiqueta y el contexto ya dice que la columna es de seniority — el nombre del nivel sigue viajando en el nombre accesible y en el tooltip.",
    ],
    whenNotToUse: [
      "Para el nivel de algo que no sea una persona (la criticidad de un sistema, la madurez de un proceso). La escala de esta pieza es la de seniority y sus etiquetas son fijas: para otra escala, usá LevelMeter directamente, que es de lo que ésta está hecha.",
      "Como control. La pieza muestra un nivel; no es un botón, ni una opción elegible, ni tiene estado seleccionado. Cambiar el seniority de una persona se hace donde se edita a la persona, con el selector del formulario.",
      "Para comunicar un estado (activo, vencido, en riesgo). Los matices de acento no son estados: para eso están Badge y sus roles semánticos.",
      "Junto a un Badge del mismo color en la misma fila. Si ya hay un badge de estado, la pieza es justamente lo que evita que dos datos distintos se digan con la misma forma.",
      "Pegada a otro contenido sin nada que las separe. No dibuja caja, así que no se delimita sola: dentro de una celda de tabla el padding de la celda ya lo resuelve, pero fuera de una tabla es responsabilidad de quien la coloca.",
    ],
    pairs: [
      {
        do: "Pasar el nombre del nivel de la escala Tuya (\"Avanzado\").",
        dont: "Pasar el número del catálogo (3) o una etiqueta propia (\"Senior\").",
        why: "La escala es cerrada y se pide por nombre. El número es una convención del backend de cada app, y traducirlo es trabajo del consumidor: aceptarlo acá ataría el sistema de diseño a un esquema de datos ajeno.",
      },
      {
        do: "Dejar que un valor inesperado caiga en el estado vacío.",
        dont: "Filtrar las personas sin nivel antes de renderizar, o mostrar un guión en su lugar.",
        why: "El estado vacío ocupa la misma dimensión que los demás, así que una persona sin nivel no desalinea la columna. Un guión suelto sí, y filtrar esconde el dato faltante en vez de mostrarlo.",
      },
      {
        do: "Usar `density=\"compact\"` dentro de una tabla.",
        dont: "Usar la densidad amplia en un listado por consistencia con otras pantallas.",
        why: "La amplia mide 44px; en una fila, ese alto multiplicado por veinte personas es media pantalla de aire. La compacta existe justamente para el caso del listado, que es el principal.",
      },
      {
        do: "Dejar que la pieza resuelva el color a partir del nivel.",
        dont: "Pasarle un tono por `className` para que combine con la pantalla, o teñir la etiqueta.",
        why: "La correspondencia entre nivel y matiz es lo único que la pieza agrega sobre LevelMeter. Romperla en una pantalla hace que el mismo color signifique cosas distintas en dos listados. Y la etiqueta va en texto neutro a propósito: el matiz vive sólo en el medidor.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <SeniorityCard level="Principiante" />
          <SeniorityCard level="Competente" />
          <SeniorityCard level="Avanzado" />
          <SeniorityCard level="Experto" />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <SeniorityCard level="Avanzado" density="compact" />
          <SeniorityCard level="Experto" hideLabel />
          <SeniorityCard level={null} />
        </div>
      </div>
    ),
    partsCaption:
      "La escala completa arriba; abajo, densidad compacta · sin etiqueta · estado vacío",
    partsDescription:
      "Dos partes y nada más: la etiqueta del nivel y, debajo, un LevelMeter de cuatro segmentos. No dibuja fondo, ni borde, ni sombra — se apoya en la superficie donde se la coloque, y por eso tampoco compone Card, que existe justamente para aportar esos tres. Lo único propio es la correspondencia entre los cuatro niveles y los cuatro matices, y la dimensión fija.",
    parts: [
      {
        name: "Ancho",
        measure: "w-seniority-card (116px)",
        note: "El mismo para los cuatro niveles y para el estado vacío. No depende de la longitud de la etiqueta: \"Principiante\" entra sin recorte y \"Experto\" deja aire. Es lo que hace comparables las filas.",
      },
      {
        name: "Alto",
        measure: "h-seniority-card (44px) · h-seniority-card-compact (36px)",
        note: "La medida del token es la medida final de la pieza (`box-border`). Se mantiene fijo aunque no haya caja que dibujar: es lo que deja parejas las filas de un listado, incluidas las que no tienen dato.",
      },
      {
        name: "Ancho reducido",
        measure: "w-seniority-card-narrow (72px)",
        note: "La variante sin etiqueta. También fijo: el punto de la pieza es que las filas se comparen, y eso vale igual sin etiqueta.",
      },
      {
        name: "Etiqueta",
        measure: "text-neutral-default · text-label",
        note: "Texto neutro en los cuatro niveles: el matiz vive sólo en el medidor. En el estado vacío pasa a `text-neutral-subtle`, para que la ausencia de dato se lea más callada que un nivel real.",
      },
      {
        name: "Medidor",
        measure: "LevelMeter con steps=4",
        note: "Cuatro segmentos, llenos hasta la posición del nivel, teñidos con `bg-accent-<matiz>-fill`. En el estado vacío se reemplaza por cuatro segmentos neutros y no hay valor que anunciar.",
      },
      {
        name: "Separación interna",
        measure: "gap-hug (space.hug, 4px)",
        note: "Entre la etiqueta y el medidor: son dos partes de una misma pieza.",
      },
      {
        name: "Relleno",
        measure: "ninguno",
        note: "Sin caja de la que separarse, el contenido ocupa el ancho fijo entero — y eso es lo que deja los medidores de filas distintas alineados borde con borde.",
      },
    ],
    renderState: (state) => {
      if (state.name === "Sin etiqueta") return <SeniorityCard level="Avanzado" hideLabel />;
      if (state.name === "Fuera de escala") return <SeniorityCard level="Senior" />;
      if (state.name === "Sin dato") return <SeniorityCard level={null} />;
      return <SeniorityCard level="Avanzado" />;
    },
    states: [
      { name: "En reposo" },
      { name: "Sin etiqueta", note: "Ancho reducido; el nivel viaja en aria-label y en el tooltip." },
      {
        name: "Fuera de escala",
        note: 'Cualquier valor que no sea uno de los cuatro niveles ("Senior", "5", "") cae acá.',
      },
      { name: "Sin dato", note: "`null` es el caso normal de una persona sin nivel asignado." },
    ],
    statesCaption:
      "No tiene hover, pressed ni seleccionado: no es un control, y su aspecto es una función pura del nivel que recibe",
  },

  accessibility: [
    {
      aspect: "Nombre accesible",
      value: "aria-label con el nombre del nivel",
      explanation:
        "Siempre presente, se vea o no la etiqueta. Es lo que hace que la variante reducida siga siendo legible para quien no ve el color.",
    },
    {
      aspect: "Tooltip",
      value: "title con el nombre del nivel",
      explanation:
        "El tooltip nativo acompaña al nombre accesible, para quien ve la pieza pero no la etiqueta. Los dos llevan lo mismo.",
    },
    {
      aspect: "Color como único canal",
      value: "no",
      explanation:
        "El nivel se comunica por tres canales a la vez: la etiqueta con su nombre, la cantidad de segmentos llenos y el matiz. Quitando el color, los otros dos siguen diciéndolo.",
    },
    {
      aspect: "Contraste de la etiqueta",
      value: "el token de texto neutro del sistema",
      explanation:
        "Al no teñirse, su contraste no depende del matiz: es el mismo token de texto que el resto de la interfaz, ya verificado contra las superficies del sistema.",
    },
    {
      aspect: "Contraste de los segmentos",
      value: "≥ 3:1 contra las cuatro superficies del sistema",
      explanation:
        "Los llenos van de 3.08:1 a 5.29:1 según el matiz y el fondo; el aro de los vacíos, de 4.21:1 a 6.88:1. Se miden contra la fila, el lienzo, la fila seleccionada y la fila en tema oscuro, porque la pieza no trae superficie propia y puede caer sobre cualquiera. La verificación falla el build si un matiz cae por debajo.",
    },
    {
      aspect: "Delimitación",
      value: "la aporta el contenedor",
      explanation:
        "La pieza no dibuja borde. En una celda de tabla el padding de la celda ya la separa de lo vecino; fuera de una tabla, quien la coloque tiene que darle ese aire.",
    },
  ],
};
