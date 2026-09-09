import React from "react";
import { SegmentedControl } from "@tuya-ui/components";

export type SegmentTone = "neutral" | "success" | "warning" | "danger";

export interface TonedSegmentedOption {
  value: string;
  label: string;
  disabled?: boolean;
  /**
   * El matiz de la opción **cuando está elegida**. Sin elegir, todas se ven
   * igual: el tono informa qué significa lo que se eligió, no invita a elegir
   * una en vez de otra.
   */
  tone?: SegmentTone;
}

export interface TonedSegmentedControlProps {
  options: TonedSegmentedOption[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  name?: string;
  className?: string;
}

/**
 * `SegmentedControl` con un matiz por opción.
 *
 * **Propuesta de extensión de tuip** (`segmented-control.tsx`): agregarle un
 * campo `tone` a `SegmentedControlOption`. Vive acá y no en el catálogo porque
 * tuip se consume como tarball local y promoverlo pide republicar el paquete.
 *
 * El hueco es real: hoy el control pinta todas las opciones igual, y hay
 * respuestas cuyo significado no es neutro —un «sí» en una pregunta crítica del
 * tamizaje no es lo mismo que un «no»—. Sin el matiz, quien lee un tamizaje
 * respondido tiene que leer pregunta por pregunta para ver dónde está el
 * problema.
 *
 * El matiz **nunca es el único canal**: la opción elegida sigue marcada como en
 * cualquier control segmentado, y el texto de la opción dice qué es. El color
 * sólo agrega lectura a lo que ya se lee sin él.
 *
 * Mientras la extensión no exista, se aplica con una clase sobre el envoltorio
 * y un selector sobre el segmento marcado; el día que tuip lo tenga, este
 * archivo se borra y las llamadas pasan `tone` directo.
 */
export const TonedSegmentedControl: React.FC<TonedSegmentedControlProps> = ({
  options,
  value,
  onValueChange,
  label,
  name,
  className = "",
}) => {
  const tone = options.find((option) => option.value === value)?.tone ?? "neutral";

  return (
    <span
      data-tone={tone}
      className={`inline-flex [&[data-tone=danger]_input:checked+*]:text-danger-default [&[data-tone=success]_input:checked+*]:text-success-default [&[data-tone=warning]_input:checked+*]:text-warning-default ${className}`}
    >
      <SegmentedControl
        options={options.map(({ value: optionValue, label: optionLabel, disabled }) => ({
          value: optionValue,
          label: optionLabel,
          disabled,
        }))}
        value={value}
        onValueChange={onValueChange}
        label={label}
        name={name}
      />
    </span>
  );
};
