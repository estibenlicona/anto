import React from "react";
import { Button, Icon, Tag } from "@tuya-ui/components";
import type { ComponentProps } from "react";

export type ValidationItemStatus = "pasa" | "advertencia" | "impedimento";

export interface ValidationItem {
  id: string;
  title: string;
  status: ValidationItemStatus;
  /** Qué falta. Nulo cuando el ítem pasa. */
  missing?: string | null;
  /** Etiqueta de la acción que lleva a arreglarlo. */
  actionLabel?: string;
}

export interface ValidationListProps {
  items: ValidationItem[];
  /**
   * A dónde lleva la acción de un ítem. Sin esto la lista informa pero no
   * resuelve, y un impedimento que no dice dónde se corrige obliga a buscarlo
   * a mano.
   */
  onGoTo?: (item: ValidationItem) => void;
  label: string;
  className?: string;
}

type IconName = ComponentProps<typeof Icon>["name"];

const TONE: Record<ValidationItemStatus, { icon: IconName; text: string; tag: string }> = {
  pasa: { icon: "status-success", text: "text-success-default", tag: "Pasa" },
  advertencia: { icon: "status-warning", text: "text-warning-default", tag: "Advertencia" },
  impedimento: { icon: "status-error", text: "text-danger-default", tag: "Impedimento" },
};

/**
 * La lista de resultados de una validación, cada uno con su estado, qué falta y
 * la acción que lleva a donde se corrige.
 *
 * **Propuesta de componente de tuip** (`validation-list.tsx`). Vive acá y no en
 * el catálogo porque tuip se consume como tarball local y promoverlo pide
 * republicar el paquete.
 *
 * No se compone con lo que hay. Una lista de `Alert` da el estado pero cada uno
 * ocupa un bloque con su propio borde, y nueve seguidos se leen como nueve
 * problemas en vez de como un informe; una `Table` da la densidad pero no el
 * icono de estado ni la acción por fila sin volver a armarlos a mano.
 *
 * El estado nunca va sólo por color: cada fila lleva su icono y su etiqueta.
 */
export const ValidationList: React.FC<ValidationListProps> = ({
  items,
  onGoTo,
  label,
  className = "",
}) => (
  <ul
    aria-label={label}
    className={`flex flex-col rounded-container border border-neutral-default ${className}`}
  >
    {items.map((item) => {
      const tone = TONE[item.status];
      return (
        <li
          key={item.id}
          className="flex items-start gap-3 border-b border-neutral-default px-4 py-3 last:border-b-0"
        >
          <Icon
            name={tone.icon}
            size={20}
            className={`mt-0.5 flex-none ${tone.text}`}
            aria-hidden="true"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex items-center gap-2 text-body-sm text-neutral-default">
              {item.title}
              <Tag>{tone.tag}</Tag>
            </span>
            {item.missing && (
              <span className="text-label text-neutral-subtle">{item.missing}</span>
            )}
          </div>
          {item.status !== "pasa" && onGoTo && (
            <Button
              variant="link"
              size="small"
              onClick={() => onGoTo(item)}
              iconAfter={<Icon name="chevron-right" size={16} />}
            >
              {item.actionLabel ?? "Ir a arreglarlo"}
            </Button>
          )}
        </li>
      );
    })}
  </ul>
);
