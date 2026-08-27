import React from "react";
import { Progress } from "@tuya-ui/components";
import type { BacklogSummary } from "../adapters/BacklogAdapter";

export interface BacklogDaySummaryProps {
  summary: BacklogSummary;
}

/**
 * Resumen del día que el contenedor publica en la franja del breadcrumb:
 * el texto con las cifras y, a su derecha, una barra estrecha. Va todo en
 * una sola fila porque la franja es una banda de navegación de una línea;
 * la barra ancha apilada bajo el texto que tenía el encabezado la haría
 * crecer y desalinearía backlog frente a células, personas y ausencias.
 */
export const BacklogDaySummary: React.FC<BacklogDaySummaryProps> = ({
  summary,
}) => (
  // h-8: la altura del botón small que células, personas y ausencias publican
  // en la franja; sin ella la franja de backlog queda 10px más baja que las
  // demás y el contenido arranca a otra altura.
  <div className="flex h-8 items-center gap-2">
    <span className="whitespace-nowrap text-body-sm text-neutral-subtle">
      <b className="tabular-nums text-neutral-default">
        {summary.classifiedToday}
      </b>{" "}
      clasificadas hoy · quedan{" "}
      <b className="tabular-nums text-neutral-default">{summary.pending}</b> de{" "}
      {summary.classifiedToday + summary.pending}
    </span>
    {/* Progress es w-full de fábrica y su className no lo anula: el ancho
        lo fija el envoltorio. Sin él, el porcentaje dentro de un flex
        shrink-to-fit colapsa el texto y la franja crece a tres líneas. */}
    <div className="w-32 shrink-0">
      <Progress value={summary.progressPercentage} label="Progreso del día" />
    </div>
  </div>
);
