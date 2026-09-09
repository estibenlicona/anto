import React from "react";
import type { ModelEditorSection } from "../../services/estimationModelService";

export interface ModelSectionNavProps {
  active: ModelEditorSection;
  onSelect: (section: ModelEditorSection) => void;
  /** Cuántos impedimentos quedan, para marcar la sección de publicar. */
  impediments?: number;
}

/**
 * Cada sección se nombra con el término más corto que la distingue de las
 * otras, y ese nombre no se repite dentro de su contenido: el rótulo ya lo dijo.
 */
const SECTIONS: { id: ModelEditorSection; label: string }[] = [
  { id: "dimensiones", label: "Dimensiones" },
  { id: "drivers", label: "Drivers" },
  { id: "tallas", label: "Tallas" },
  { id: "mix", label: "Mix" },
  { id: "publicar", label: "Publicar" },
];

/**
 * Las cinco secciones del editor, con una visible a la vez.
 *
 * Es una lista de enlaces y no pestañas con estado local porque cada sección es
 * una ruta: así el botón de un impedimento puede llevar a donde se corrige, y
 * recargar la página abre donde estaba (design.md — D8). El teclado funciona
 * porque son botones de verdad, sin manejo escrito a mano.
 */
export const ModelSectionNav: React.FC<ModelSectionNavProps> = ({
  active,
  onSelect,
  impediments = 0,
}) => (
  <nav aria-label="Secciones del modelo">
    <ul className="flex flex-wrap gap-1 border-b border-neutral-default">
      {SECTIONS.map((section) => {
        const current = section.id === active;
        return (
          <li key={section.id}>
            <button
              type="button"
              aria-current={current ? "page" : undefined}
              onClick={() => onSelect(section.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-body-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-default ${
                current
                  ? "border-brand-default font-semibold text-neutral-default"
                  : "border-transparent text-neutral-subtle hover:text-neutral-default"
              }`}
            >
              {section.label}
              {section.id === "publicar" && impediments > 0 && (
                <span className="ml-2 rounded-pill bg-danger-subtle px-1.5 font-mono text-label tabular-nums text-danger-default">
                  {impediments}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);
