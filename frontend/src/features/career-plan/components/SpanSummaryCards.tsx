import React from "react";
import {
  Avatar,
  AvatarGroup,
  Card,
  CardBody,
  Sparkline,
} from "@tuya-ui/components";
import { getPersonInitials } from "@features/people/adapters/PersonAdapter";
import { cycleLabel } from "@features/assessments/services/assessmentService";
import type { SpanSummaryDto } from "../services/careerPlanService";

export interface SpanSummaryCardsProps {
  summary: SpanSummaryDto | null;
  loading: boolean;
  /** El camino a las personas que acumulan brechas. */
  onSeePeople: () => void;
}

/** Cuántos avatares se dibujan antes de resumir el resto con un "+N". */
const AVATAR_SAMPLE = 3;

const Metric: React.FC<{
  label: string;
  children: React.ReactNode;
  foot: React.ReactNode;
}> = ({ label, children, foot }) => (
  <Card>
    <CardBody className="flex h-full flex-col justify-between gap-1">
      <span className="text-label text-neutral-subtle">{label}</span>
      <span className="text-metric tabular-nums text-neutral-default">
        {children}
      </span>
      <span className="text-body-sm text-neutral-subtle">{foot}</span>
    </CardBody>
  </Card>
);

/**
 * Las cuatro lecturas con las que se entra a Competencias, siempre sobre el
 * span completo: no siguen al recorte de habilidades ni al orden que el
 * Chapter Lead tenga puesto. Son la situación del chapter, no la de la vista —
 * y una cifra que cambia al filtrar deja de ser una situación.
 */
export const SpanSummaryCards: React.FC<SpanSummaryCardsProps> = ({
  summary,
  loading,
  onSeePeople,
}) => {
  if (loading || !summary) return null;

  const {
    totalGaps,
    criticalGaps,
    evaluatedPeople,
    totalPeople,
    peopleAtRisk,
    previousCycle,
    trend,
  } = summary;

  const cobertura =
    totalPeople === 0 ? 0 : Math.round((evaluatedPeople / totalPeople) * 100);

  /*
    La variación compara los dos últimos puntos de la MISMA serie y no el total
    de hoy contra el ciclo anterior: el total cuenta a cada persona por su
    evaluación más reciente, sea del ciclo que sea, y un punto de la serie sólo
    cuenta a quienes cerraron en ESE ciclo. Restar uno del otro mezcla dos
    poblaciones y produce un delta que no describe ningún cambio real.

    El signo se muestra siempre, también cuando no cambió: es una variación, y
    un número suelto se leería como un total.
  */
  const actual =
    trend.length > 0 ? trend[trend.length - 1].totalGaps : totalGaps;
  const delta =
    previousCycle === null ? null : actual - previousCycle.totalGaps;

  const visibles = peopleAtRisk.slice(0, AVATAR_SAMPLE);
  const excedente = peopleAtRisk.length - visibles.length;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Metric
        label="BRECHAS CRÍTICAS"
        foot={`de ${totalGaps} ${totalGaps === 1 ? "brecha abierta" : "brechas abiertas"} · no se cierran con la operación diaria`}
      >
        {criticalGaps}
      </Metric>

      <Metric
        label="COBERTURA DE EVALUACIÓN"
        foot={`${evaluatedPeople} de ${totalPeople} personas · sin evaluación no entran a los totales`}
      >
        {cobertura}%
      </Metric>

      <Card>
        <CardBody className="flex h-full flex-col justify-between gap-1">
          <span className="text-label text-neutral-subtle">
            VS. CICLO ANTERIOR
          </span>
          {delta === null ? (
            <>
              {/* Un cero diría "no cambió nada", que no es lo mismo que no
                  tener con qué comparar. */}
              <span className="text-body font-medium text-neutral-default">
                Sin ciclo anterior
              </span>
              <span className="text-body-sm text-neutral-subtle">
                Este es el primer ciclo cerrado del chapter
              </span>
            </>
          ) : (
            <>
              <span className="flex items-end gap-3">
                <span
                  className={`text-metric tabular-nums ${
                    delta <= 0 ? "text-success-default" : "text-danger-default"
                  }`}
                >
                  {/* Menos brechas es mejor: el color lo dice, y el signo
                      evita que haya que deducirlo. */}
                  {delta > 0 ? "+" : delta < 0 ? "−" : "="}
                  {delta === 0 ? "" : Math.abs(delta)}
                </span>
                <Sparkline
                  className="mb-1 flex-1"
                  points={trend.map((p) => ({
                    label: cycleLabel(p.cycle),
                    value: p.totalGaps,
                  }))}
                  tone={delta <= 0 ? "sky" : "magenta"}
                  label="Brechas por ciclo"
                />
              </span>
              <span className="text-body-sm text-neutral-subtle">
                {delta === 0
                  ? "Las mismas brechas que"
                  : delta < 0
                    ? `${Math.abs(delta)} ${Math.abs(delta) === 1 ? "brecha menos" : "brechas menos"} que`
                    : `${delta} ${delta === 1 ? "brecha más" : "brechas más"} que`}{" "}
                {cycleLabel(previousCycle!.cycle).toLowerCase()}
              </span>
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex h-full flex-col justify-between gap-1">
          <span className="text-label text-neutral-subtle">
            PERSONAS EN RIESGO
          </span>
          {peopleAtRisk.length === 0 ? (
            <>
              {/* La card no desaparece: que nadie esté en riesgo también es una
                  lectura, y su ausencia se confundiría con no haberlo mirado. */}
              <span className="text-metric tabular-nums text-neutral-default">
                0
              </span>
              <span className="text-body-sm text-neutral-subtle">
                Nadie acumula tres brechas o más
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-3">
                <span className="text-metric tabular-nums text-neutral-default">
                  {peopleAtRisk.length}
                </span>
                {/* `colorId` con el id: el color de una persona es el mismo en
                    toda la app, no uno por pantalla. */}
                <AvatarGroup max={visibles.length + 1}>
                  {visibles.map((person) => (
                    <Avatar
                      key={person.personId}
                      size="small"
                      label={`${person.personName} · ${person.gapCount} brechas`}
                      colorId={person.personId}
                    >
                      {getPersonInitials(person.personName)}
                    </Avatar>
                  ))}
                  {excedente > 0 && (
                    <Avatar size="small" label={`${excedente} más`}>
                      +{excedente}
                    </Avatar>
                  )}
                </AvatarGroup>
              </span>
              {/* Los nombres, en texto: en los avatares viven como `aria-label`
                  de un elemento sin cargo, que los lectores de pantalla no
                  anuncian. Quien no ve la card se quedaba sólo con la cifra. */}
              <ul className="sr-only">
                {peopleAtRisk.map((person) => (
                  <li key={person.personId}>
                    {person.personName}: {person.gapCount} brechas
                  </li>
                ))}
              </ul>
              <span className="text-body-sm text-neutral-subtle">
                con tres brechas o más ·{" "}
                <button
                  type="button"
                  onClick={onSeePeople}
                  className="underline underline-offset-2"
                >
                  ver todas
                </button>
              </span>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
