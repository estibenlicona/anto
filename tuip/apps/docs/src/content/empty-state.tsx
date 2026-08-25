import { Button, EmptyState, Icon } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const emptyStateContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Cuando una lista, una tabla o una sección todavía no tiene ningún elemento — el estado \"vacío\" de los cinco que todo componente del sistema debe cubrir.",
      "Después de que un filtro o una búsqueda no arroja resultados.",
      "Cuando el usuario no tiene permiso para ver el contenido de esa sección.",
    ],
    whenNotToUse: [
      "Para un error de carga: eso es un Alert de severidad `danger`, no un EmptyState — la ausencia de datos y el fallo al pedirlos son cosas distintas.",
      "Mientras los datos todavía se están pidiendo: eso es Skeleton. EmptyState confirma que no hay nada; Skeleton anticipa que todavía no se sabe.",
    ],
    pairs: [
      {
        do: "Elegir el ícono, el título y la acción según cuál de las tres situaciones es: sin datos aún invita a crear, sin resultados invita a limpiar filtros, sin permiso dice a quién pedirlo.",
        dont: "Reusar el mismo texto genérico (\"No hay datos\") para las tres situaciones.",
        why: "Las tres piden una reacción distinta de quien las lee; un texto genérico no le dice a la persona qué hacer a continuación, que es justamente lo que un estado vacío bien resuelto aporta.",
      },
      {
        do: "Pasar un `Button` real como `action` cuando hay algo que hacer (crear el primer elemento, limpiar el filtro).",
        dont: "Dejar la acción como el único camino y sin describirla en el título — la acción refuerza el texto, no lo reemplaza.",
        why: "Igual que en Alert, EmptyState no sabe qué hace la acción ni la ejecuta: reusa Button para foco, teclado y estados en vez de reimplementar un control.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <EmptyState
        icon={<Icon name="status-empty" size={32} />}
        title="Aún no hay iniciativas en este chapter"
        description="Cuando crees la primera, aparecerá aquí con su estimación y las células asignadas."
        action={<Button variant="primary">Crear iniciativa</Button>}
      />
    ),
    partsCaption: "ícono + título + descripción opcional + acción opcional, todo centrado",
    partsDescription:
      "EmptyState no trae contenedor propio: ni borde ni fondo. Se apoya en la superficie donde el consumidor lo coloque — una Card, el cuerpo de una Table sin filas, una sección de página — igual que Alert se apoya en el layout que lo rodea en vez de imponer su propia tarjeta.",
    parts: [
      {
        name: "Ícono",
        measure: "32px",
        note: "El único tamaño de la librería reservado para ilustración de estado vacío — ningún otro contexto lo usa.",
      },
      {
        name: "Título",
        measure: "text-body font-semibold",
        note: "Un `<p>`, no un heading forzado: el nivel de encabezado correcto depende de dónde se use EmptyState, y eso lo decide el consumidor.",
      },
      {
        name: "Descripción",
        measure: "text-body-sm, max-w-[44ch]",
        note: "Ancho acotado para que la línea no se estire de punta a punta cuando EmptyState ocupa todo el ancho de su contenedor.",
      },
      {
        name: "Separación",
        measure: "mb-4 (ícono) · mt-2 (descripción) · mt-5 (acción)",
        note: "Tres saltos crecientes: cada parte se separa un poco más de la anterior a medida que el contenido se vuelve más opcional.",
      },
    ],
    renderState: (state) => {
      if (state.name === "Sin resultados") {
        return (
          <EmptyState
            icon={<Icon name="search" size={32} />}
            title="Sin resultados para “backend platform”"
            description="Probá con otro término o limpiá los filtros activos."
          />
        );
      }
      if (state.name === "Sin permiso") {
        return (
          <EmptyState
            icon={<Icon name="status-locked" size={32} />}
            title="No tenés acceso a esta célula"
            description="Pedile a tu lead de capacidad que te agregue como colaborador."
          />
        );
      }
      return (
        <EmptyState
          icon={<Icon name="status-empty" size={32} />}
          title="Aún no hay iniciativas en este chapter"
          description="Cuando crees la primera, aparecerá aquí."
          action={<Button variant="primary">Crear iniciativa</Button>}
        />
      );
    },
    states: [
      { name: "Sin datos aún", note: "Invita a crear el primer elemento." },
      { name: "Sin resultados", note: "Invita a ajustar la búsqueda o los filtros, sin acción de creación." },
      { name: "Sin permiso", note: "Dice a quién pedirlo, sin acción — no hay nada que el usuario pueda resolver por su cuenta." },
    ],
    statesCaption: "Las tres situaciones que EmptyState cubre — misma estructura, distinto ícono, texto y acción",
  },

  accessibility: [
    {
      aspect: "Ícono",
      value: "decorativo (aria-hidden)",
      explanation: "El título ya nombra lo que falta; el ícono lo refuerza visualmente sin anunciarse dos veces a un lector de pantalla.",
    },
    {
      aspect: "Título",
      value: "<p>, sin heading forzado",
      explanation: "EmptyState no impone un nivel de encabezado porque no sabe en qué punto de la jerarquía de la página va a aparecer; si el contexto lo pide, el consumidor puede envolverlo en su propio heading.",
    },
    {
      aspect: "Acción",
      value: "control real, propio foco",
      explanation: "Al ser un slot que recibe un Button u otro control real, la acción entra en el orden de tabulación con su propia semántica — EmptyState no la reimplementa.",
    },
  ],
};
