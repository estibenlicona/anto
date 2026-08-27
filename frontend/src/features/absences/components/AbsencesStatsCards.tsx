import React from "react";
import { Card, CardBody, Icon } from "@tuya-ui/components";
import type { AbsencesMonth } from "../adapters/AbsenceAdapter";
import { formatBusinessDays } from "../services/businessDays";

/**
 * Las tres lecturas del mes visible, con la misma anatomía de cards que el
 * resto de la app (rótulo + cifra + pie). El impacto cuenta sólo lo aprobado.
 */
export const AbsencesStatsCards: React.FC<{
  month: AbsencesMonth;
  /** FTE del chapter: el total contra el que se lee el descuento. */
  chapterFte: number | null;
}> = ({ month, chapterFte }) => {
  const impact = month.approvedFteImpact;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label uppercase text-neutral-subtle">
              {month.monthTitle}
            </span>
            <Icon name="calendar" size={16} className="text-neutral-subtle" />
          </div>
          <span className="text-metric tabular-nums text-neutral-default">
            {month.totalCount}
          </span>
          <span className="mt-auto text-body-sm text-neutral-subtle">
            {month.totalCount === 1 ? "ausencia" : "ausencias"} ·{" "}
            <b className="font-bold tabular-nums text-neutral-default">
              {formatBusinessDays(month.totalBusinessDaysInMonth)}
            </b>{" "}
            {/*
              La cifra es la suma de días hábiles ausentes, no el calendario
              del mes —ése es `monthBusinessDays`—. El rótulo decía "del mes" y
              con el listado acotado al chapter la diferencia se nota: el
              número baja, y con el rótulo viejo se leería como un error.
            */}
            {month.totalBusinessDaysInMonth === 1
              ? "día hábil ausente"
              : "días hábiles ausentes"}
          </span>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label uppercase text-neutral-subtle">
              Impacto en capacidad
            </span>
            <Icon name="capacity" size={16} className="text-neutral-subtle" />
          </div>
          {/*
            La cifra sola no se interpreta: "−0.5 FTE" no dice si es mucho o
            poco. Contra el total del chapter se lee sin saber cómo se calcula,
            y además se vuelve comparable entre meses. Sin ese total —o con
            total cero— se muestra el descuento solo, nunca una fracción sobre
            cero.
          */}
          <span
            className={`text-metric tabular-nums ${
              impact > 0 ? "text-warning-default" : "text-neutral-default"
            }`}
          >
            {/* Dos decimales, como la columna de cada fila: con uno solo,
                un descuento de 0.04 se muestra como "−0.0" y la tarjeta dice
                que no hay impacto cuando sí lo hay. */}
            {impact > 0 ? `−${impact.toFixed(2)}` : "0.00"}
          </span>
          {/* La unidad y su referencia van al pie, como en las otras dos
              cards: arriba la cifra sola, abajo lo que la hace legible. */}
          <span className="mt-auto text-body-sm text-neutral-subtle">
            {chapterFte && chapterFte > 0
              ? `de ${chapterFte.toFixed(1)} FTE del chapter`
              : "FTE"}
          </span>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label uppercase text-neutral-subtle">
              Por aprobar
            </span>
            <Icon
              name="status-pending"
              size={16}
              className="text-neutral-subtle"
            />
          </div>
          <span className="text-metric tabular-nums text-neutral-default">
            {month.pendingCount}
          </span>
          <span className="mt-auto text-body-sm text-neutral-subtle">
            {month.pendingCount === 1
              ? "solicitud espera tu decisión"
              : "solicitudes esperan tu decisión"}
          </span>
        </CardBody>
      </Card>
    </div>
  );
};
