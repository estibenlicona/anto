import { ActivityTimeline, ActivityTimelineItem } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const activityTimelineContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Como respaldo de auditoría de un flujo de aprobaciones: quién hizo qué y cuándo, en orden cronológico.",
      "Dentro del detalle de un elemento — el `DrawerBody` de una fila, una `Card` de historial — nunca como una pantalla propia.",
    ],
    whenNotToUse: [
      "Para una lista sin orden temporal: eso es una lista simple, no un timeline — ActivityTimeline no aporta nada si el orden de las entradas no importa.",
      "Para notificar algo que acaba de pasar: eso es Toast. ActivityTimeline es el registro persistente, no el aviso puntual.",
    ],
    pairs: [
      {
        do: "Pasar `actor` y `action` como props separadas.",
        dont: "Escribir todo el texto en un solo nodo y poner el nombre en negrita a mano.",
        why: "ActivityTimelineItem arma el orden y el énfasis por construcción — así ninguna entrada puede olvidarse de distinguir tipográficamente al actor.",
      },
      {
        do: "Montar ActivityTimeline dentro de una Card, un Drawer o cualquier superficie que el consumidor ya tenga.",
        dont: "Buscar un borde o un fondo propio en el componente.",
        why: "No trae superficie propia — la misma decisión que ya tomó EmptyState — para no imponer una segunda tarjeta cuando ya hay una.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <ActivityTimeline>
        <ActivityTimelineItem
          variant="success"
          actor="C. Ospina"
          action="aprobó la ampliación"
          detail="SOL-2041 · +4,0 Gbps para CEL-00842, efectiva el 15 sep."
          timestamp="hoy 09:41"
        />
        <ActivityTimelineItem
          variant="danger"
          actor="Sistema"
          action="detectó umbral superado"
          detail="CEL-00907 alcanzó 95% de utilización (umbral 85%)."
          timestamp="hoy 06:02"
        />
        <ActivityTimelineItem
          variant="info"
          actor="M. Restrepo"
          action="creó la solicitud"
          detail="SOL-2041 · justificación: proyección supera umbral en 60 días."
          timestamp="ayer 17:20"
        />
        <ActivityTimelineItem
          variant="neutral"
          actor="J. Betancur"
          action="actualizó el umbral de zona"
          detail="Bogotá · Centro pasó de 80% a 85%."
          timestamp="6 ago 11:05"
        />
      </ActivityTimeline>
    ),
    partsCaption: "punto + línea de conexión + actor en negrita + acción + detalle opcional + marca de tiempo",
    partsDescription:
      "Cada entrada es un ActivityTimelineItem: un punto de color conectado al de la siguiente entrada por una línea vertical, el texto de actor+acción en una línea, un detalle opcional debajo, y la marca de tiempo alineada a la derecha. La línea de conexión desaparece sola después de la última entrada — no es algo que el consumidor tenga que resolver.",
    parts: [
      {
        name: "Punto",
        measure: "bg-{role}-bold, el mismo mapeo de Badge",
        note: "success/info/warning/danger/discovery/neutral — ningún token nuevo, la misma decisión que ya valida Badge para sus seis roles de estado.",
      },
      {
        name: "Actor",
        measure: "<strong> + font-semibold",
        note: "Siempre antes que la acción, siempre distinguido tipográficamente — no depende de que quien use el componente recuerde ponerlo en negrita.",
      },
      {
        name: "Detalle",
        measure: "opcional, text-neutral-subtle",
        note: "Si no se pasa, no deja un hueco vacío en su lugar — la entrada sin detalle ocupa menos alto que la que sí lo tiene.",
      },
      {
        name: "Orden",
        measure: "<ol> / <li>",
        note: "Lista ordenada, no genérica — es una secuencia cronológica y así lo anuncia un lector de pantalla.",
      },
    ],
    renderState: (state) => (
      <ActivityTimeline>
        <ActivityTimelineItem
          variant="info"
          actor="M. Restrepo"
          action="creó la solicitud"
          detail={state.name === "Con detalle" ? "SOL-2041 · justificación: proyección supera umbral en 60 días." : undefined}
          timestamp="ayer 17:20"
        />
      </ActivityTimeline>
    ),
    states: [
      { name: "Con detalle", note: "La línea secundaria aparece debajo de la acción." },
      { name: "Sin detalle", note: "Sin la prop `detail`, la entrada no reserva el espacio — no queda una línea en blanco." },
    ],
    statesCaption: "El detalle es la única parte que varía visualmente entre entradas",
  },

  accessibility: [
    {
      aspect: "Estructura",
      value: "<ol> / <li>, no <div>",
      explanation: "Un lector de pantalla anuncia la cantidad de entradas y la posición de cada una porque es una lista real, no una serie de bloques genéricos.",
    },
    {
      aspect: "Color del punto",
      value: "decorativo (aria-hidden), nunca la única fuente",
      explanation: "\"aprobó\", \"detectó umbral superado\", \"creó\", \"actualizó\" ya distinguen la naturaleza del evento en texto — quien no percibe el color del punto entiende igual qué pasó.",
    },
    {
      aspect: "Sin superficie propia",
      value: "sin fondo ni borde",
      explanation: "Al no imponer su propia superficie, no interfiere con el heading, el foco ni la estructura del contenedor donde se lo coloque.",
    },
  ],
};
