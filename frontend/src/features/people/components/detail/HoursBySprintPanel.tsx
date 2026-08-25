import React from "react";
import { segmentFillClass } from "@tuya-ui/components";
import { MIX_COLORS } from "@features/squads/components/mixColors";
import type { PersonDetail } from "../../adapters/PersonDetailAdapter";
import { DetailPanel, SECONDARY_TEXT } from "./DetailPanel";

export interface HoursBySprintPanelProps {
  detail: PersonDetail;
}

const BAU_FILL = segmentFillClass({ color: MIX_COLORS.bau });
const INITIATIVE_FILL = segmentFillClass({ color: MIX_COLORS.transformation });

/**
 * Barras verticales apiladas (BAU + Iniciativa) por sprint, contra la línea de
 * las horas que corresponden a la dedicación asignada. tuip no tiene gráfico
 * de barras vertical (brecha anotada en tasks): se dibuja con divs teñidos con
 * `segmentFillClass`, la misma clase que SegmentedBar — mismo color por
 * construcción.
 */
export const HoursBySprintPanel: React.FC<HoursBySprintPanelProps> = ({
  detail,
}) => {
  const sprints = detail.sprints;
  const reported = sprints.filter((s) => s.status !== "NotReported");
  const sprintHours = sprints[0]?.sprintHours ?? 80;
  const max = sprintHours;
  const expectedPct = Math.min(100, (detail.expectedHours / max) * 100);
  const hasAssignment = detail.allocation !== null;

  return (
    <DetailPanel
      title="Horas por sprint"
      subtitle="reportadas y validadas · últimos 6 sprints"
      right={
        reported.length > 0 ? (
          <span className={`flex items-center gap-3 ${SECONDARY_TEXT}`}>
            <span className="inline-flex items-center gap-1.5">
              <span className={`size-2 rounded-pill ${BAU_FILL}`} />
              BAU
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={`size-2 rounded-pill ${INITIATIVE_FILL}`} />
              Iniciativa
            </span>
            {hasAssignment && (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-0 w-3.5 border-t-2 border-dashed border-neutral-bold" />
                Asignado {detail.allocation?.dedicationPercentage} %
              </span>
            )}
          </span>
        ) : undefined
      }
      className="flex flex-col gap-2.5 px-4 pb-3 pt-5"
    >
      {reported.length === 0 ? (
        <div className="flex flex-col items-center gap-1 py-6 text-center">
          <span className="text-body-sm font-medium text-neutral-default">
            Todavía no hay sprints reportados
          </span>
          <span className={SECONDARY_TEXT}>
            {hasAssignment
              ? "El primero aparecerá cuando cierre el sprint en curso."
              : "Empezará a reportar cuando quede asignada a una célula."}
          </span>
        </div>
      ) : (
        <>
          <div
            className="relative grid h-28 items-end gap-6"
            style={{
              gridTemplateColumns: `repeat(${sprints.length}, minmax(0, 1fr))`,
            }}
            role="img"
            aria-label={`Horas por sprint: ${sprints
              .map((s) => `${s.sprint} ${s.workedHours} h`)
              .join(", ")}`}
          >
            {hasAssignment && (
              <div
                aria-hidden="true"
                className="absolute inset-x-0 z-10 border-t-2 border-dashed border-neutral-bold"
                style={{ bottom: `${expectedPct}%` }}
              />
            )}
            {sprints.map((s) => {
              const height = (s.workedHours / max) * 100;
              const bauShare = s.workedHours
                ? (s.bauHours / s.workedHours) * 100
                : 0;
              return (
                <div
                  key={s.sprint}
                  className={`flex flex-col overflow-hidden rounded-t-sm ${
                    s.validated ? "" : "opacity-55"
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${s.sprint}: ${s.bauHours} h BAU · ${s.initiativeHours} h Iniciativa`}
                >
                  <div
                    className={INITIATIVE_FILL}
                    style={{ flex: 100 - bauShare }}
                  />
                  <div className={BAU_FILL} style={{ flex: bauShare }} />
                </div>
              );
            })}
          </div>
          <div
            className={`grid gap-6 text-center tabular-nums ${SECONDARY_TEXT}`}
            style={{
              gridTemplateColumns: `repeat(${sprints.length}, minmax(0, 1fr))`,
            }}
          >
            {sprints.map((s) => (
              <span
                key={s.sprint}
                className={s.validated ? undefined : "text-warning-default"}
              >
                {s.sprint}
                <br />
                {s.status === "NotReported"
                  ? "sin reportar"
                  : `${s.workedHours} h${s.validated ? "" : " · por validar"}`}
              </span>
            ))}
          </div>
          {hasAssignment && (
            <p className={`mt-1 ${SECONDARY_TEXT}`}>
              Horas sin las libres. Al {detail.allocation?.dedicationPercentage}{" "}
              % de un sprint de {sprintHours} h corresponden{" "}
              {detail.expectedHours} h
              {detail.overReportingStreak >= 2
                ? `: los ${detail.overReportingStreak} últimos sprints validados van por encima.`
                : "."}
            </p>
          )}
        </>
      )}
    </DetailPanel>
  );
};
