import React from "react";
import { MonthNav } from "@shared/components/MonthNav";

export interface AbsencesMonthNavProps {
  monthTitle: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

/**
 * El mes visible y sus dos saltos, publicado por el contenedor en la franja
 * del breadcrumb. Delegado en el `MonthNav` compartido (Prefacturación usa el
 * mismo control); acá no hay tope de rango: se registran ausencias futuras.
 */
export const AbsencesMonthNav: React.FC<AbsencesMonthNavProps> = ({
  monthTitle,
  onPreviousMonth,
  onNextMonth,
}) => (
  <MonthNav
    title={monthTitle}
    onPrevious={onPreviousMonth}
    onNext={onNextMonth}
  />
);
