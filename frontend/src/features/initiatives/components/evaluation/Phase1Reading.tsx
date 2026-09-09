import React from "react";
import {
  Alert,
  Card,
  CardBody,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from "@tuya-ui/components";
import { BandScale } from "@shared/components/BandScale";
import type {
  EvaluationModel,
  EvaluationResult,
} from "../../services/evaluationModel";
import {
  fteText,
  monthsText,
  pmExpectedText,
  tallaColor,
} from "../../adapters/InitiativeAdapter";
import {
  heaviestDimension,
  pctText,
  pmText,
  uncertaintyFactor,
} from "../../adapters/EvaluationAdapter";
import { TARGET_MONTH_OPTIONS } from "../../hooks/useEvaluation";

export interface Phase1ReadingProps {
  model: EvaluationModel;
  result: EvaluationResult;
}

/**
 * La lectura del resultado de Fase 1, sin marco ni acciones.
 *
 * Vive aparte del paso del asistente porque la ficha de la iniciativa muestra
 * exactamente lo mismo sobre la evaluación ya guardada: si el cuerpo siguiera
 * dentro de `ResultStep` habría que copiarlo, y dos copias de una lectura de
 * seis bloques se separan a la primera corrección.
 */
export const Phase1Reading: React.FC<Phase1ReadingProps> = ({
  model,
  result,
}) => {
  const heaviest = heaviestDimension(result);
  const factor = uncertaintyFactor(result.band.pmMin, result.band.pmMax);
  const totalHeads = result.mix.reduce((a, m) => a + m.people, 0);
  // El punto medio de la banda, que es de donde el motor saca el FTE.
  const pmExpected = (result.band.pmMin + result.band.pmMax) / 2;
  const pending = result.totalQuestions - result.answered;

  return (
    <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-4">
        {/* Tamaño y esfuerzo, separados. El modelo los calcula por caminos
            distintos —el score da la talla y la talla da la banda de PM— y
            con una sola cifra al frente esa diferencia no se ve. */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardBody className="flex flex-col gap-2">
              <span className="text-label text-neutral-subtle">Tamaño</span>
              <div className="flex items-center gap-3">
                <Tag color={tallaColor(result.talla)}>{result.talla}</Tag>
                <span className="text-heading-lg font-semibold tabular-nums text-neutral-default">
                  {pctText(result.pct)}
                </span>
              </div>
              <span className="text-label font-normal tracking-normal text-neutral-subtle">
                {result.band.lectura} · banda {result.band.minPct}–
                {result.band.maxPct} del score
              </span>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex flex-col gap-2">
              <span className="text-label text-neutral-subtle">Esfuerzo</span>
              <div className="flex items-baseline gap-2">
                <span className="text-heading-lg font-semibold tabular-nums text-neutral-default">
                  {pmExpectedText(result.band.pmMin, result.band.pmMax)}
                </span>
                <span className="text-body-sm text-neutral-subtle">
                  PM esperados
                </span>
              </div>
              <span className="text-label font-normal tracking-normal text-neutral-subtle">
                Entre {pmText(result.band.pmMin, result.band.pmMax)} PM ·
                amplitud {factor}×
              </span>
            </CardBody>
          </Card>
        </div>

        <BandScale
          label="Escala de tallas"
          bands={model.bands.map((b) => ({
            label: b.talla,
            from: b.minPct,
            to: b.maxPct,
          }))}
          value={result.pct}
          activeBand={result.talla}
        />

        {/* La capacidad, que sí depende del plazo. Las cuatro filas llevan
            el mismo esfuerzo y la misma talla: es la forma de ver la regla
            (RN-34) sin enunciarla. */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-body font-semibold text-neutral-default">
              Capacidad que exige el plazo
            </h3>
            <span className="text-label font-normal tracking-normal text-neutral-subtle">
              No modifica talla ni esfuerzo
            </span>
          </div>
          <div className="overflow-hidden rounded-surface border border-neutral-default">
            <Table flush density="compact">
              <TableHeader>
                <TableRow>
                  <TableHead>Plazo</TableHead>
                  <TableHead align="right">FTE requerido</TableHead>
                  <TableHead align="right">Rango</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TARGET_MONTH_OPTIONS.map((months) => {
                  const current = months === result.targetMonths;
                  return (
                    <TableRow key={months}>
                      <TableCell>
                        <span
                          className={
                            current ? "font-semibold" : "text-neutral-subtle"
                          }
                        >
                          {monthsText(months)}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <span
                          className={`tabular-nums ${current ? "font-semibold" : "text-neutral-subtle"}`}
                        >
                          {fteText(pmExpected / months)}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <span className="tabular-nums text-neutral-subtle">
                          {fteText(result.band.pmMin / months)} –{" "}
                          {fteText(result.band.pmMax / months)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {result.band.action && (
          <Alert variant="info" title="Acción recomendada">
            {result.band.action}
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-body font-semibold text-neutral-default">
              Equipo que pide la talla {result.talla}
            </h3>
            <span className="text-label font-normal tracking-normal text-neutral-subtle">
              Mix de capacidades · FTE según el plazo
            </span>
          </div>
          {result.mix.length === 0 ? (
            <p className="text-body-sm text-neutral-subtle">
              El mix de capacidades no define personas para esta talla.
            </p>
          ) : (
            <div className="overflow-hidden rounded-surface border border-neutral-default">
              <Table flush>
                <TableHeader>
                  <TableRow>
                    <TableHead>Capacidad</TableHead>
                    <TableHead align="right">Personas</TableHead>
                    <TableHead>Composición</TableHead>
                    <TableHead align="right">FTE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.mix.map((m) => (
                    <TableRow key={m.capability}>
                      <TableCell>
                        <span className="font-medium">{m.capability}</span>
                      </TableCell>
                      <TableCell align="right">
                        <span className="tabular-nums">{m.people}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={m.compositionPct}
                            label={`Composición ${m.capability}`}
                            className="flex-1"
                          />
                          <span className="w-10 text-right text-label font-normal tracking-normal tabular-nums text-neutral-subtle">
                            {m.compositionPct}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell align="right">
                        <span className="tabular-nums">{fteText(m.fte)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <span className="font-semibold">Total</span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="font-semibold tabular-nums">
                        {totalHeads}
                      </span>
                    </TableCell>
                    <TableCell />
                    <TableCell align="right">
                      <span className="font-semibold tabular-nums">
                        {fteText(result.fteExpected)}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-body font-semibold text-neutral-default">
          De dónde viene el score
        </h3>
        <ul className="flex flex-col gap-2.5">
          {result.dimensions.map((d) => (
            <li key={d.dimension} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2 text-body-sm">
                <span className="text-neutral-default">{d.dimension}</span>
                {/* Su puntaje y cuánto pesa: una dimensión al 100% que pesa
                    el 6% mueve mucho menos que una al 60% que pesa el 19%. */}
                <span className="flex-none tabular-nums text-neutral-subtle">
                  {d.pct}% · pesa {d.weightPct}%
                </span>
              </div>
              <Progress value={d.pct} label={d.dimension} />
            </li>
          ))}
        </ul>
        <span className="border-t border-neutral-default pt-2.5 text-label font-normal tracking-normal tabular-nums text-neutral-subtle">
          {result.points} de {result.maxPoints} puntos posibles ={" "}
          {pctText(result.pct)}
        </span>
        {pending > 0 ? (
          <Alert
            variant="warning"
            title={`${pending} ${pending === 1 ? "pregunta" : "preguntas"} sin responder`}
          >
            Falta{pending === 1 ? "" : "n"} en{" "}
            {result.dimensions
              .filter((d) => d.answered < d.total)
              .map((d) => d.dimension)
              .join(", ")}
            . Una sin responder cuenta como cero.
          </Alert>
        ) : (
          heaviest.pct > 0 && (
            <Alert variant="info" title={`${heaviest.dimension} pesa más`}>
              Es la dimensión con más puntaje ({heaviest.pct}%).
            </Alert>
          )
        )}
      </div>
    </div>
  );
};
