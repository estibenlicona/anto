import React from "react";

export interface MatrixNumberCellProps {
  /**
   * El peso. `undefined` es **no aporta**, que no es lo mismo que `0`: cero es
   * "aporta a esta salida, y en esta versión pesa cero", una decisión de
   * calibración que alguien puede subir después; no aportar es una afirmación
   * sobre el modelo.
   */
  value: number | undefined;
  /** Nombre accesible: qué pregunta y qué salida es esta celda. */
  label: string;
  /** Sin esto la celda es de sólo lectura — una versión publicada no se edita. */
  onChange?: (value: number | undefined) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  className?: string;
}

/**
 * Una celda de la matriz pregunta × salida, con tres estados y no dos: un
 * número, el guion de «no aporta», y el vacío mientras se escribe.
 *
 * **Propuesta de componente de tuip** (`matrix-number-cell.tsx`). Vive acá y no
 * en el catálogo porque tuip se consume como tarball local y promoverlo pide
 * republicar el paquete.
 *
 * No se compone con lo que hay. Un `Input type="number"` tiene dos estados —con
 * valor y vacío— y en él «vacío» significa «todavía no escribí», que es
 * exactamente lo que acá hay que distinguir de «no aporta». La diferencia no es
 * cosmética: el motor excluye del máximo a la pregunta que no aporta, y la suma
 * un cero a la que pesa cero.
 *
 * El guion se anuncia con palabras, no con el carácter: un lector de pantalla
 * leyendo «menos» no dice lo mismo que «no aporta».
 */
export const MatrixNumberCell: React.FC<MatrixNumberCellProps> = ({
  value,
  label,
  onChange,
  disabled = false,
  min = 0,
  max = 99,
  className = "",
}) => {
  const readOnly = disabled || !onChange;
  const contributes = value !== undefined;

  if (readOnly) {
    return (
      <span
        className={`inline-flex h-8 w-14 items-center justify-center rounded-control font-mono text-body-sm tabular-nums ${
          contributes ? "text-neutral-default" : "text-neutral-subtle"
        } ${className}`}
      >
        <span aria-hidden="true">{contributes ? value : "—"}</span>
        <span className="sr-only">
          {label}: {contributes ? value : "no aporta"}
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        aria-label={label}
        value={contributes ? String(value) : ""}
        placeholder="—"
        onChange={(event) => {
          const raw = event.target.value;
          // Vaciar el campo es "no aporta": es la única forma de llegar a ese
          // estado sin un control aparte, y es la que espera quien lo borra.
          onChange(raw === "" ? undefined : Number(raw));
        }}
        className={`h-8 w-14 rounded-control border border-neutral-default bg-neutral-default px-2 text-center font-mono text-body-sm tabular-nums text-neutral-default placeholder:text-neutral-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-default ${
          contributes ? "" : "border-dashed"
        }`}
      />
      <span className="sr-only">
        {contributes ? `${label}: ${value}` : `${label}: no aporta`}
      </span>
    </span>
  );
};
