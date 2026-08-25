import { FilterButton } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const filterButtonContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para filtrar el contenido de una tabla u otra lista por una propiedad de valores conocidos, como \"Seniority\" o \"Nivel SFIA\".",
      "Cuando el filtro admite marcar más de un valor a la vez.",
    ],
    whenNotToUse: [
      "Para elegir un único valor de un conjunto, como parte de un formulario — usa Select.",
      "Para buscar texto libre — usa SearchField.",
    ],
    pairs: [
      {
        do: "Dejar que el consumidor decida qué hacer con el conjunto de opciones marcadas (filtrar en cliente, pedir al backend, etc.).",
        dont: "Esperar que FilterButton filtre ningún dato por su cuenta.",
        why: "FilterButton solo notifica selección, igual que Select o Combobox — filtrar los datos reales depende de dónde viven.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex items-center gap-3">
        <FilterButton
          label="Seniority"
          options={[
            { value: "junior", label: "Junior" },
            { value: "senior", label: "Senior" },
          ]}
          selected={[]}
          onChange={() => {}}
        />
        <FilterButton
          label="Seniority"
          options={[
            { value: "junior", label: "Junior" },
            { value: "senior", label: "Senior" },
          ]}
          selected={["junior"]}
          onChange={() => {}}
        />
      </div>
    ),
    partsCaption: "Sin opciones activas, y con una opción marcada",
    partsDescription:
      "FilterButton compone Popover y Checkbox, ya existentes — el trigger es un botón con ícono, etiqueta y, cuando hay opciones marcadas, un contador; el contenido es un Checkbox por opción.",
    parts: [
      {
        name: "Trigger inactivo",
        measure: "border-neutral-default bg-neutral-default",
        note: "Mismo tratamiento que un botón secundario en reposo.",
      },
      {
        name: "Trigger activo",
        measure: "border-brand-default bg-brand-subtle text-brand-default",
        note: "Se activa en cuanto selected.length es mayor que cero, sin necesitar que el consumidor lo calcule aparte.",
      },
      {
        name: "Contador",
        measure: "bg-brand-bold, rounded-pill",
        note: "Muestra la cantidad de opciones marcadas, sólo cuando hay al menos una.",
      },
    ],
    renderState: (state) => (
      <FilterButton
        label="Seniority"
        options={[
          { value: "junior", label: "Junior" },
          { value: "senior", label: "Senior" },
        ]}
        selected={state.name === "Activo" ? ["junior"] : []}
        onChange={() => {}}
        className={state.className}
      />
    ),
    states: [{ name: "Inactivo" }, { name: "Activo" }],
    statesCaption: "El único estado visual además del foco es tener o no opciones marcadas",
  },

  accessibility: [
    {
      aspect: "Semántica del trigger",
      value: "button dentro de PopoverTrigger",
      explanation:
        "El disparador es un botón real, así que responde a teclado y a lectores de pantalla igual que cualquier otro botón del catálogo.",
    },
    {
      aspect: "Opciones",
      value: "Checkbox reales",
      explanation:
        "Cada opción es un Checkbox con su propio label asociado — mismo soporte de teclado y de tecnologías de asistencia que Checkbox ya tiene resuelto.",
    },
  ],
};
