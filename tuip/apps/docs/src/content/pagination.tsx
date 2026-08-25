import { Pagination } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const paginationContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para navegar una lista dividida en páginas, típicamente debajo de una Table.",
      "Cuando el total de páginas puede ser grande: los puntos suspensivos mantienen los controles compactos sin perder la primera, la última ni la página actual.",
    ],
    whenNotToUse: [
      "Para scroll infinito o carga incremental: ahí no hay “páginas” que numerar, sino un flujo continuo.",
      "Para mostrar cuántos ítems hay en total o cuántos están seleccionados: ese texto no es parte de Pagination — se compone como contenido libre junto a ella.",
    ],
    pairs: [
      {
        do: "Mantener `page` en el estado del consumidor y pasarlo de vuelta a Pagination tras cada `onPageChange`.",
        dont: "Esperar que Pagination recuerde la página actual por su cuenta.",
        why: "Pagination no tiene estado propio — solo notifica la intención de cambiar de página; quien la usa decide si el cambio es válido (por ejemplo, tras cargar los datos de la página nueva).",
      },
      {
        do: "Colocar el texto de resumen (“24 resultados”, “1 seleccionada de 24”) en el mismo contenedor flex, junto a Pagination.",
        dont: "Buscar una prop en Pagination para ese texto.",
        why: "Ese texto varía por caso de uso (con o sin selección, singular o plural) — es contenido de producto, no de un componente de navegación reusable.",
      },
    ],
  },

  anatomy: {
    renderParts: () => <Pagination page={4} pageCount={9} onPageChange={() => {}} />,
    partsCaption: "anterior · números de página · siguiente",
    partsDescription:
      "La página actual se resalta con fondo sólido; anterior y siguiente son botones cuadrados con borde propio, distintos de los números para que el usuario nunca confunda \"ir a la página 1\" con \"retroceder una\".",
    parts: [
      {
        name: "Control anterior/siguiente",
        measure: "h-8 w-8 · border-neutral-default",
        note: "Cuadrado con borde propio, se deshabilita en el límite correspondiente del rango.",
      },
      {
        name: "Página actual",
        measure: "bg-neutral-bold + text-neutral-inverse",
        note: "Única página con fondo sólido; el resto son botones de texto plano.",
      },
      {
        name: "Puntos suspensivos",
        measure: "no interactivos",
        note: "Reemplazan un rango de páginas intermedias; nunca son clicables ni cuentan como una página.",
      },
    ],
    renderState: (state) => {
      if (state.name === "Primera página") {
        return <Pagination page={1} pageCount={9} onPageChange={() => {}} />;
      }
      if (state.name === "Última página") {
        return <Pagination page={9} pageCount={9} onPageChange={() => {}} />;
      }
      return <Pagination page={4} pageCount={9} onPageChange={() => {}} />;
    },
    states: [
      { name: "Primera página", note: "El control anterior se deshabilita." },
      { name: "Página intermedia" },
      { name: "Última página", note: "El control siguiente se deshabilita." },
    ],
    statesCaption: "Los límites del rango deshabilitan solo el control de ese lado, no ambos",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: "<nav aria-label>",
      explanation:
        "Pagination se anuncia como una región de navegación con nombre, distinguible de otras regiones de la página.",
    },
    {
      aspect: "Página actual",
      value: 'aria-current="page"',
      explanation:
        "El botón de la página activa lleva `aria-current`, no solo un color distinto — así una tecnología de asistencia sabe cuál está seleccionada aunque no perciba el color.",
    },
    {
      aspect: "Controles de límite",
      value: "disabled nativo",
      explanation:
        "Anterior y siguiente se deshabilitan con el atributo nativo del botón en los extremos del rango, en vez de solo aparentar estar apagados.",
    },
    {
      aspect: "Puntos suspensivos",
      value: "aria-hidden",
      explanation:
        "No son un control, así que se ocultan a tecnologías de asistencia en vez de anunciarse como un elemento vacío o confuso.",
    },
  ],
};
