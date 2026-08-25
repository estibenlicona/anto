import React from "react";
import { Progress } from "@tuya-ui/components";
import type { BacklogSummary } from "../adapters/BacklogAdapter";

export interface BacklogHeaderProps {
  summary: BacklogSummary | null;
}

export const BacklogHeader: React.FC<BacklogHeaderProps> = ({ summary }) => (
  <div className="flex items-end justify-between gap-6">
    <div>
      <h1 className="text-heading-lg font-semibold text-neutral-default">
        Backlog
      </h1>
      <p className="text-body-sm text-neutral-subtle">
        Una historia a la vez: decidí si es iniciativa, BAU o nada. Sólo lo
        clasificado cuenta como FTE real.
      </p>
    </div>
    {summary && (
      <div className="flex w-80 shrink-0 flex-col items-end gap-1.5">
        <span className="text-body-sm text-neutral-subtle">
          <b className="tabular-nums text-neutral-default">
            {summary.classifiedToday}
          </b>{" "}
          clasificadas hoy · quedan{" "}
          <b className="tabular-nums text-neutral-default">{summary.pending}</b>{" "}
          de {summary.classifiedToday + summary.pending}
        </span>
        <Progress
          value={summary.progressPercentage}
          label="Progreso del día"
          className="w-full"
        />
      </div>
    )}
  </div>
);
