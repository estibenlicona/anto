import React from "react";
import { Button, Icon } from "@tuya-ui/components";

export interface MonthNavProps {
  /** El mes visible, con nombre y año ("Agosto 2026"). */
  title: string;
  onPrevious: () => void;
  onNext: () => void;
  /** Tope del rango hacia atrás: la flecha queda visible pero deshabilitada. */
  previousDisabled?: boolean;
  /** Tope del rango hacia adelante (por ejemplo, el mes en curso). */
  nextDisabled?: boolean;
}

/**
 * El mes visible y sus dos saltos. Vive en la franja del breadcrumb del shell,
 * publicado por el contenedor de la pantalla: es lo que acota todo lo que la
 * pantalla muestra, así que no es un filtro de tabla sino un control de la
 * pantalla entera. Lo comparten Ausencias y Prefacturación.
 */
export const MonthNav: React.FC<MonthNavProps> = ({
  title,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
}) => (
  <div className="flex items-center gap-1">
    <Button
      variant="subtle"
      size="small"
      aria-label="Mes anterior"
      disabled={previousDisabled}
      onClick={onPrevious}
    >
      {/* No hay chevron-left en el set: es el right girado. */}
      <Icon
        name="chevron-right"
        size={16}
        style={{ transform: "rotate(180deg)" }}
      />
    </Button>
    {/* Ancho fijo inline: la app no compila Tailwind y esta medida no existe en el CSS del paquete. */}
    <span
      className="text-center text-body-sm font-semibold text-neutral-default"
      style={{ minWidth: "128px" }}
    >
      {title}
    </span>
    <Button
      variant="subtle"
      size="small"
      aria-label="Mes siguiente"
      disabled={nextDisabled}
      onClick={onNext}
    >
      <Icon name="chevron-right" size={16} />
    </Button>
  </div>
);
