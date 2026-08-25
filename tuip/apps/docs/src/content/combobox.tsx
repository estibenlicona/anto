import { Combobox } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

const SAMPLE_OPTIONS = [
  { value: "java", label: "Java" },
  { value: "as-400", label: "AS-400" },
  { value: "kafka", label: "Kafka" },
  { value: "postgres", label: "PostgreSQL" },
  { value: "react", label: "React" },
  { value: "node", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "terraform", label: "Terraform" },
];

export const comboboxContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para elegir entre más de 20 opciones, donde recorrer la lista sin filtrar sería más lento que escribir.",
      "Para clasificaciones de varios valores a la vez, con las opciones elegidas visibles como chips dentro del propio campo.",
    ],
    whenNotToUse: [
      "Con 20 opciones o menos: usa Select. El campo de búsqueda es fricción de más cuando la lista completa ya cabe en un desplegable.",
      "Cuando el usuario necesita crear una opción que no existe en la lista: Combobox filtra lo que ya existe, no da de alta valores nuevos.",
    ],
    pairs: [
      {
        do: "Mostrar explícitamente que no hay resultados cuando el texto no coincide con ninguna opción.",
        dont: "Dejar la lista vacía sin ningún mensaje.",
        why: "Una lista vacía sin explicación no distingue \"seguí escribiendo\" de \"no existe esa opción\"; el mensaje evita que el usuario reintente en vano.",
      },
      {
        do: "Dejar que los chips de selección múltiple se remuevan con un clic o con Backspace sobre el campo vacío.",
        dont: "Obligar a reabrir la lista y deseleccionar la opción para quitar un chip.",
        why: "El chip ya está a la vista; pedir que se vuelva a abrir la lista para deshacer algo visible es un paso de más.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <Combobox
        label="Tecnologías"
        placeholder="Buscar…"
        options={SAMPLE_OPTIONS}
        multiple
        defaultValue={["java", "kafka"]}
        className="w-72"
      />
    ),
    partsCaption: "campo con chips de selección múltiple y placeholder de búsqueda",
    partsDescription:
      "El campo es el mismo trigger de un Select, pero puede crecer en altura: cuando hay chips, el contenido envuelve en vez de recortarse. El popover que abre contiene el campo de búsqueda arriba y la lista filtrable debajo.",
    parts: [
      {
        name: "Altura mínima del campo",
        measure: "size.control.md (por defecto), con min-height en vez de height fija",
        note: "A diferencia de Select, el campo crece: los chips de selección múltiple pueden ocupar más de una línea.",
      },
      {
        name: "Chip",
        measure: "radius.control, space.hug entre el texto y el ícono de quitar",
        note: "Comparte el radio con los controles, no con el badge — un chip removible es una acción, no un estado.",
      },
      {
        name: "Campo de búsqueda del popover",
        measure: "space.inset como relleno, borde inferior de border.width.default",
        note: "Separa visualmente la búsqueda de la lista de resultados, sin necesitar una segunda superficie.",
      },
      {
        name: "Anillo de foco",
        measure: "focusRing",
        note: "Igual que en Select: el mismo token, sin resolverlo por su cuenta.",
      },
    ],
    renderState: (state) => (
      <Combobox
        label="Tecnologías"
        placeholder="Buscar…"
        options={SAMPLE_OPTIONS}
        className={state.className}
        disabled={state.disabled}
      />
    ),
    states: [
      { name: "Reposo" },
      {
        name: "Hover",
        className: "ring-1 ring-border-neutral-bold",
        note: "Aproximado, igual que en Select: el hover real es del navegador sobre el botón nativo.",
      },
      { name: "Foco", className: "ring-focus ring-border-brand-focus" },
      { name: "Deshabilitado", disabled: true },
    ],
    statesCaption: "Reposo, hover, foco y deshabilitado — el popover abierto con chips se documenta en Uso",
  },

  accessibility: [
    {
      aspect: "Rol del campo de búsqueda",
      value: 'role="combobox" aria-expanded aria-controls aria-activedescendant',
      explanation:
        "El campo de búsqueda de cmdk sigue el mismo patrón WAI-ARIA de combobox que Select, y además anuncia cuál opción de la lista filtrada está activa mientras se navega con flechas.",
    },
    {
      aspect: "Rol de la lista",
      value: 'role="listbox"',
      explanation: "La lista de resultados filtrados se anuncia como lista de selección.",
    },
    {
      aspect: "Rol de cada opción",
      value: 'role="option" aria-selected',
      explanation: "Cada resultado anuncia si está entre los elegidos, incluida la selección múltiple.",
    },
    {
      aspect: "Teclado",
      value: "tipeo filtra, ↓/↑ recorre el resultado filtrado, Enter confirma, Escape cierra",
      explanation:
        "Backspace sobre el campo vacío quita el último chip elegido, así que la selección múltiple se puede deshacer sin tocar el mouse.",
    },
    {
      aspect: "Sin resultados",
      value: 'texto explícito dentro del listbox, no una lista vacía',
      explanation:
        "El mensaje forma parte del contenido anunciado, así que un lector de pantalla informa la ausencia de resultados en vez de quedarse en silencio.",
    },
  ],
};
