import { Breadcrumb } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const breadcrumbContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para orientar dentro de una jerarquía de navegación de varios niveles, mostrando el camino desde la raíz hasta la página actual.",
    ],
    whenNotToUse: [
      "Para una app de un solo nivel, sin jerarquía real: un breadcrumb con dos niveles fijos no aporta nada que el título de la página no diga ya.",
      "Como reemplazo de Tabs: breadcrumb muestra dónde estás dentro de una jerarquía; Tabs alterna entre secciones del mismo nivel.",
    ],
    pairs: [
      {
        do: "Dejar que Breadcrumb colapse el centro cuando la ruta supera tres niveles.",
        dont: "Truncar las etiquetas de cada nivel para que todos entren en una línea.",
        why: "Colapsar niveles completos conserva cada etiqueta legible; truncar el texto no resuelve el espacio y además vuelve las etiquetas ambiguas.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Plataforma", href: "#" },
            { label: "Células", href: "#" },
            { label: "Backend Platform" },
          ]}
        />
        <Breadcrumb
          items={[
            { label: "Plataforma", href: "#" },
            { label: "Células", href: "#" },
            { label: "Backend Platform", href: "#" },
            { label: "Capacidades", href: "#" },
            { label: "Julián Pérez" },
          ]}
        />
      </div>
    ),
    partsCaption: "ruta de tres niveles · ruta de cinco niveles colapsada",
    partsDescription:
      "Breadcrumb es un solo componente con `items: { label, href? }[]` — no partes compuestas, porque cada nivel tiene la misma forma (una etiqueta y, opcionalmente, un enlace), igual que las opciones de Select.",
    parts: [
      {
        name: "Separador",
        measure: "/ · text-neutral-subtle",
        note: "Decorativo, oculto a tecnologías de asistencia — el orden de los `<li>` ya comunica la jerarquía.",
      },
      {
        name: "Nivel actual",
        measure: "font-medium text-neutral-default",
        note: "El único nivel sin enlace; se distingue también por peso de fuente, no solo por no ser clicable.",
      },
      {
        name: "Colapso",
        measure: "primero + … + último",
        note: "Se activa automáticamente a partir de cuatro niveles — el consumidor no decide cuándo colapsar.",
      },
    ],
    renderState: (state) => {
      if (state.name === "Colapsada") {
        return (
          <Breadcrumb
            items={[
              { label: "Plataforma", href: "#" },
              { label: "Células", href: "#" },
              { label: "Backend Platform", href: "#" },
              { label: "Capacidades", href: "#" },
              { label: "Julián Pérez" },
            ]}
          />
        );
      }
      return (
        <Breadcrumb
          items={[
            { label: "Plataforma", href: "#" },
            { label: "Células", href: "#" },
            { label: "Backend Platform" },
          ]}
        />
      );
    },
    states: [
      { name: "Ruta corta", note: "Tres niveles o menos: se muestran todos." },
      { name: "Colapsada", note: "Más de tres niveles: el centro se reemplaza por un único «…»." },
    ],
    statesCaption: "El colapso es automático, no una prop que el consumidor active",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: '<nav aria-label> + <ol>',
      explanation:
        "Se anuncia como una región de navegación con nombre, y la lista ordenada comunica que hay una secuencia de niveles, no un menú de opciones sueltas.",
    },
    {
      aspect: "Nivel actual",
      value: 'aria-current="page"',
      explanation:
        "El último nivel se marca como la página actual — una tecnología de asistencia puede anunciarlo distinto del resto sin depender del estilo visual.",
    },
    {
      aspect: "Separadores",
      value: "aria-hidden",
      explanation:
        "Los símbolos \"/\" son decorativos y se ocultan, para no anunciarse entre cada nivel como si fueran contenido.",
    },
    {
      aspect: "Niveles colapsados",
      value: "no interactivos",
      explanation:
        "El indicador «…» no es un enlace ni un botón — no ofrece una forma de expandir los niveles ocultos, así que no queda en el orden de tabulación prometiendo una interacción que no tiene.",
    },
  ],
};
