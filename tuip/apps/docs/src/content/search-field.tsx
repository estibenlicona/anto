import { SearchField } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const searchFieldContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para una búsqueda acotada al contenido de una pantalla, como filtrar las filas de una Table por nombre o cargo.",
      "En vez de Input a secas, cuando el campo es específicamente de búsqueda: el ícono de lupa lo comunica sin depender solo del placeholder.",
    ],
    whenNotToUse: [
      "Para la búsqueda global de la plataforma: esa es NavbarSearch, ya integrada a Navbar con su propio atajo de teclado.",
      "Como campo de texto genérico sin intención de búsqueda — usa Input, que no lleva el ícono de lupa.",
    ],
    pairs: [
      {
        do: "Dejar que el consumidor decida cuándo dispara la búsqueda (en cada tecla, con debounce, al enviar el formulario).",
        dont: "Esperar que SearchField ejecute la búsqueda por sí mismo.",
        why: "SearchField solo notifica el valor ingresado — la misma responsabilidad que ya tiene Input, sin agregar lógica de búsqueda propia.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex w-full max-w-xs flex-col gap-3">
        <SearchField placeholder="Buscar por nombre o cargo" />
        <SearchField label="Buscar" placeholder="Buscar por nombre o cargo" />
      </div>
    ),
    partsCaption: "Sin label (uso típico en una barra sobre una tabla) y con label",
    partsDescription:
      "SearchField no compone Input como hijo: reimplementa la línea del input con las mismas clases, porque el ícono tiene que alinearse solo con esa línea — envolver Input entero desalinearía el ícono en cuanto hay un label arriba.",
    parts: [
      {
        name: "Ícono",
        measure: "Icon \"search\", 16px, left-3",
        note: "Siempre a la izquierda, con el mismo tratamiento de color que el placeholder (text-neutral-subtle).",
      },
      {
        name: "Padding del input",
        measure: "pl-9",
        note: "Deja lugar al ícono sin que el texto ingresado lo toque.",
      },
    ],
    renderState: (state) => (
      <SearchField
        placeholder="Buscar por nombre o cargo"
        disabled={state.name === "Deshabilitado"}
        error={state.name === "Con error" ? "No se pudo aplicar la búsqueda" : undefined}
        className={state.className}
      />
    ),
    states: [
      { name: "Reposo" },
      { name: "Con error" },
      { name: "Deshabilitado", disabled: true },
    ],
    statesCaption: "Mismos estados que Input: reposo, error y deshabilitado",
  },

  accessibility: [
    {
      aspect: "Nombre accesible",
      value: "label (opcional) o placeholder",
      explanation:
        "Sin label, el placeholder queda como única pista visible del propósito del campo — igual que en Input, se recomienda label cuando el campo necesita quedar identificado incluso con contenido escrito.",
    },
    {
      aspect: "Ícono decorativo",
      value: "sin rol ni texto propio",
      explanation:
        "El ícono de lupa es puramente visual: no lleva significado que una tecnología de asistencia necesite anunciar aparte del campo mismo.",
    },
  ],
};
