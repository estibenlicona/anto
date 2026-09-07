import React from "react";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import type { SprintRow } from "../adapters/DedicationAdapter";
import { formatRate, MINUS } from "../adapters/DedicationAdapter";

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export interface TrendPanelProps {
  sprints: SprintRow[];
  onSelect: (name: string) => void;
  selected: string;
}

/**
 * La trayectoria: una fila por sprint, del más reciente al más antiguo —se
 * entra por el de ahora—, con el cumplimiento también como barra para que una
 * caída sostenida se vea antes de leerse. Cada fila lleva a su sprint, y la
 * del elegido va en el tinte de selección del sistema, el mismo de una fila
 * activa en cualquier tabla.
 *
 * Es una tabla y no un gráfico grande a propósito: la tendencia se consulta,
 * no se vigila. Los sprints sin snapshot se marcan y van sin cifras: no
 * entran en el cálculo.
 */
export const TrendPanel: React.FC<TrendPanelProps> = ({
  sprints,
  onSelect,
  selected,
}) => {
  const sealed = sprints.filter((s) => s.countsForHistory);
  const rates = sealed
    .map((s) => s.execution.completionRate)
    .filter((v): v is number => v !== null);
  const trend = rates.length >= 2 ? rates[rates.length - 1] - rates[0] : null;

  return (
    <div className="flex flex-col">
      <Table flush>
        <TableHeader>
          <TableRow>
            <TableHead>Sprint</TableHead>
            <TableHead align="right">Comprometidos</TableHead>
            <TableHead align="right">Completados</TableHead>
            <TableHead align="right">Cumplimiento</TableHead>
            <TableHead align="right">Carry-over</TableHead>
            <TableHead className="w-56 pl-6">Cumplimiento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...sprints].reverse().map((sprint) => {
            const current = sprint.name === selected;
            const rate = sprint.execution.completionRate;
            return (
              <TableRow
                key={sprint.name}
                onClick={() => onSelect(sprint.name)}
                aria-selected={current}
                className={`cursor-pointer ${current ? "bg-brand-subtle hover:bg-brand-subtle" : ""}`}
              >
                <TableCell>
                  <span className="flex flex-col">
                    <span className="text-body-sm font-semibold text-neutral-default">
                      {sprint.name}
                    </span>
                    <span className="flex items-center gap-2 text-body-sm tabular-nums text-neutral-subtle">
                      {sprint.rangeLabel} ·{" "}
                      {sprint.isCurrent ? "en curso" : "finalizado"}
                      {sprint.snapshotStatus === "Missing" && (
                        <Badge variant="warning">{sprint.snapshotLabel}</Badge>
                      )}
                    </span>
                  </span>
                </TableCell>
                <TableCell align="right">{sprint.committedLabel}</TableCell>
                <TableCell align="right">{sprint.completedLabel}</TableCell>
                <TableCell align="right">
                  <span className="font-semibold">
                    {sprint.completionLabel}
                  </span>
                </TableCell>
                <TableCell align="right">{sprint.carryOverLabel}</TableCell>
                <TableCell className="pl-6">
                  {rate !== null && (
                    <div
                      aria-hidden="true"
                      className="h-2 w-full overflow-hidden rounded-pill bg-neutral-subtle"
                    >
                      {/* Informativo en el sprint en curso —todavía se mueve—
                          y grafito en los sellados. */}
                      <div
                        className={`h-full ${
                          sprint.isCurrent ? "bg-info-bold" : "bg-neutral-bold"
                        }`}
                        style={{ width: `${Math.min(100, rate)}%` }}
                      />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <p className="border-t border-neutral-default bg-neutral-subtlest px-4 py-3 text-body-sm text-neutral-subtle">
        {trend === null
          ? `${plural(sealed.length, "sprint sellado", "sprints sellados")} en la ventana de histórico.`
          : `Cumplimiento ${trend >= 0 ? "+" : MINUS}${formatRate(Math.abs(trend))} en ${plural(sealed.length, "sprint sellado", "sprints sellados")} · las cifras del sprint en curso aún pueden cambiar.`}{" "}
        Elegir una fila lleva la ficha a ese sprint.
      </p>
    </div>
  );
};
