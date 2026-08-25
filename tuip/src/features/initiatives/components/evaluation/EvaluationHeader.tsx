import React from "react";
import {
  Badge,
  Card,
  CardBody,
  SegmentedControl,
  Tag,
} from "@tuya-ui/components";
import type { Initiative } from "../../adapters/InitiativeAdapter";
import { fteText, tallaColor } from "../../adapters/InitiativeAdapter";
import { pctText, pmText } from "../../adapters/EvaluationAdapter";
import type { EvaluationResult } from "../../services/evaluationModel";
import { TARGET_MONTH_OPTIONS } from "../../hooks/useEvaluation";

export interface EvaluationHeaderProps {
  initiative: Initiative;
  result: EvaluationResult;
  targetMonths: number;
  onTargetMonthsChange: (months: number) => void;
}

const Metric: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-label text-neutral-subtle">{label}</span>
    <span className="text-heading-md font-semibold tabular-nums text-neutral-default">
      {children}
    </span>
  </div>
);

/**
 * Qué se evalúa y el resultado en vivo, siempre a la vista. El plazo vive
 * acá porque es lo único que el Chapter Lead cambia sin responder nada —
 * y sólo mueve el FTE, nunca la talla (RN-34).
 */
export const EvaluationHeader: React.FC<EvaluationHeaderProps> = ({
  initiative,
  result,
  targetMonths,
  onTargetMonthsChange,
}) => {
  const options = TARGET_MONTH_OPTIONS.includes(
    targetMonths as (typeof TARGET_MONTH_OPTIONS)[number]
  )
    ? [...TARGET_MONTH_OPTIONS]
    : [...TARGET_MONTH_OPTIONS, targetMonths].sort((a, b) => a - b);
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-heading-lg font-semibold text-neutral-default">
            {initiative.name}
          </h1>
          <Badge variant={initiative.statusVariant}>
            {initiative.statusLabel}
          </Badge>
        </div>
        <p className="text-body-sm text-neutral-subtle">
          Célula {initiative.squadName} · Product Owner:{" "}
          {initiative.productOwner}
        </p>
      </div>
      <Card>
        <CardBody className="flex flex-wrap items-center gap-5 py-3">
          <div className="flex flex-col items-center gap-1 border-r border-neutral-default pr-5">
            <span className="text-label text-neutral-subtle">Talla</span>
            <Tag color={tallaColor(result.talla)}>{result.talla}</Tag>
          </div>
          <Metric label="Complejidad">{pctText(result.pct)}</Metric>
          <Metric label="Esfuerzo">
            {pmText(result.band.pmMin, result.band.pmMax)}{" "}
            <span className="text-body-sm font-medium text-neutral-subtle">
              PM
            </span>
          </Metric>
          <Metric label="FTE esperado">
            {fteText(result.fteExpected)}{" "}
            <span className="text-body-sm font-medium text-neutral-subtle">
              FTE
            </span>
          </Metric>
          <div className="flex flex-col gap-1 border-l border-neutral-default pl-5">
            <span className="text-label text-neutral-subtle">
              Plazo objetivo
            </span>
            <SegmentedControl
              label="Plazo objetivo en meses"
              options={options.map((m) => ({
                value: String(m),
                label: `${m} m`,
              }))}
              value={String(targetMonths)}
              onValueChange={(v) => onTargetMonthsChange(Number(v))}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
