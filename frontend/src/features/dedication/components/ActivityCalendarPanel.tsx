import React from "react";
import { Tooltip } from "@tuya-ui/components";
import type {
  ActivityCalendar,
  ActivityCell,
  ActivityLevel,
} from "../adapters/DedicationAdapter";

export interface ActivityCalendarPanelProps {
  calendar: ActivityCalendar;
  rangeLabel: string;
}

const WEEKDAY_HEADERS = ["L", "M", "X", "J", "V", "S", "D"];

/**
 * La intensidad en la escala de **acento** de tuip —celeste → azul → violeta →
 * magenta—, que es la que el sistema reserva para pasos ordinales de una
 * cantidad: cuánto hizo, no si está bien o mal. Ni estado ni atención: un día
 * con muchos commits no es una alerta.
 *
 * Los dos pasos más altos llevan el texto invertido: el relleno ya es oscuro
 * y el número tiene que seguir leyéndose encima.
 */
const LEVEL_CLASSES: Record<ActivityLevel, string> = {
  0: "bg-neutral-default text-neutral-subtle",
  1: "bg-accent-sky-fill text-neutral-default",
  2: "bg-accent-blue-fill text-neutral-inverse",
  3: "bg-accent-violet-fill text-neutral-inverse",
  4: "bg-accent-magenta-fill text-neutral-inverse",
};

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

/**
 * Una celda por día: la fecha arriba y, cuando hubo algo, cuántas acciones
 * abajo. Que la cifra esté en la celda es lo que permite leer un día sin
 * pasar el puntero; el detalle por tipo sigue en el nombre accesible.
 */
const Cell: React.FC<{ cell: ActivityCell }> = ({ cell }) => {
  if (!cell.inSprint) {
    return <span aria-hidden="true" className="h-14" />;
  }
  const border = cell.isWeekend
    ? "border-dashed border-neutral-default"
    : "border-neutral-default";
  const ring = cell.isToday ? "ring-2 ring-neutral-focus-ring" : "";
  return (
    <Tooltip content={cell.label}>
      <button
        type="button"
        aria-label={cell.label}
        data-level={cell.level}
        data-date={cell.date}
        className={`flex h-14 w-full flex-col justify-between rounded-control border px-2 py-1.5 text-left outline-none focus-visible:ring-focus focus-visible:ring-neutral-focus-ring ${border} ${ring} ${
          cell.isFuture ? "opacity-60" : ""
        } ${LEVEL_CLASSES[cell.level]}`}
      >
        <span className="text-label font-normal tracking-normal tabular-nums opacity-85">
          {cell.dayOfMonth}
        </span>
        <span className="text-body-sm font-semibold tabular-nums">
          {cell.total > 0 ? cell.total : ""}
        </span>
      </button>
    </Tooltip>
  );
};

/**
 * La evidencia: un día por celda con la intensidad de lo que la persona hizo
 * en DevOps —commits, releases y features creadas—, por semana, y al lado los
 * totales por tipo y la última actividad. El nivel va por el total del día;
 * el detalle por tipo está en el nombre accesible y en el tooltip de cada
 * celda.
 */
export const ActivityCalendarPanel: React.FC<ActivityCalendarPanelProps> = ({
  calendar,
  rangeLabel,
}) => (
  <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
    <div className="flex flex-col gap-4 border-neutral-default p-4 lg:border-r">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-label text-neutral-subtle">
          MAPA DE ACTIVIDAD · {rangeLabel.toUpperCase()}
        </h3>
        <span className="text-body-sm tabular-nums text-neutral-subtle">
          {calendar.activeDaysLabel}
        </span>
      </div>
      <div
        role="grid"
        aria-label="Actividad por día"
        className="flex flex-col gap-1"
      >
        <div role="row" className="grid grid-cols-7 gap-1">
          {WEEKDAY_HEADERS.map((label, i) => (
            <span
              key={i}
              role="columnheader"
              aria-hidden="true"
              className="pb-1 pl-0.5 text-label text-neutral-subtlest"
            >
              {label}
            </span>
          ))}
        </div>
        {calendar.weeks.map((week, w) => (
          <div key={w} role="row" className="grid grid-cols-7 gap-1">
            {week.map((cell) => (
              <span key={cell.date} role="gridcell" className="flex">
                <Cell cell={cell} />
              </span>
            ))}
          </div>
        ))}
      </div>
      <div
        className="flex items-center gap-1.5 text-body-sm text-neutral-subtle"
        aria-hidden="true"
      >
        <span>Menos</span>
        {([0, 1, 2, 3, 4] as ActivityLevel[]).map((level) => (
          <span
            key={level}
            className={`size-3.5 rounded-compact border border-neutral-default ${LEVEL_CLASSES[level]}`}
          />
        ))}
        <span>Más</span>
      </div>
    </div>

    <div className="flex flex-col border-t border-neutral-default lg:border-t-0">
      {calendar.hasActivity ? (
        <>
          <dl className="grid grid-cols-3 border-b border-neutral-default">
            {(
              [
                ["Commits", calendar.totals.commits],
                ["Releases", calendar.totals.releases],
                ["Features", calendar.totals.features],
              ] as const
            ).map(([label, value], i) => (
              <div
                key={label}
                className={`flex flex-col gap-1 p-4 ${
                  i < 2 ? "border-r border-neutral-default" : ""
                }`}
              >
                <dt className="text-label text-neutral-subtle">
                  {label.toUpperCase()}
                </dt>
                <dd className="text-heading-lg tabular-nums text-neutral-default">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="p-4 text-body-sm text-neutral-subtle">
            {calendar.lastActivityLabel} ·{" "}
            {plural(calendar.totals.total, "acción", "acciones")} en el sprint
          </p>
        </>
      ) : (
        <p className="p-4 text-body-sm text-neutral-subtle">
          Sin actividad en este sprint
        </p>
      )}
    </div>
  </div>
);
