import React from "react";
import { Button, Icon } from "@tuya-ui/components";

export interface AbsencesHeaderProps {
  monthTitle: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onRegister: () => void;
}

export const AbsencesHeader: React.FC<AbsencesHeaderProps> = ({
  monthTitle,
  onPreviousMonth,
  onNextMonth,
  onRegister,
}) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h1 className="text-heading-lg font-semibold text-neutral-default">
        Ausencias
      </h1>
      <p className="text-body-sm text-neutral-subtle">
        Vacaciones, permisos e incapacidades del chapter. Lo aprobado descuenta
        capacidad del período.
      </p>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="subtle"
          size="small"
          aria-label="Mes anterior"
          onClick={onPreviousMonth}
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
          {monthTitle}
        </span>
        <Button
          variant="subtle"
          size="small"
          aria-label="Mes siguiente"
          onClick={onNextMonth}
        >
          <Icon name="chevron-right" size={16} />
        </Button>
      </div>
      <Button
        variant="primary"
        onClick={onRegister}
        iconBefore={<Icon name="calendar" size={16} />}
      >
        Registrar ausencia
      </Button>
    </div>
  </div>
);
