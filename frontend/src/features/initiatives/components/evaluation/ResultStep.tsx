import React from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Icon,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from "@tuya-ui/components";
import type {
  EvaluationModel,
  EvaluationResult,
} from "../../services/evaluationModel";
import { fteText, tallaColor } from "../../adapters/InitiativeAdapter";
import {
  heaviestDimension,
  pctText,
  pmText,
  uncertaintyFactor,
} from "../../adapters/EvaluationAdapter";
import { StepFrame } from "./StepFrame";

export interface ResultStepProps {
  model: EvaluationModel;
  result: EvaluationResult;
  saving: boolean;
  onPrev: () => void;
  onSave: () => void;
}

const Stat: React.FC<{
  label: string;
  value: string;
  help: string;
  emphasis?: boolean;
}> = ({ label, value, help, emphasis }) => (
  <Card className={emphasis ? "border-bold border-neutral-bold" : undefined}>
    <CardBody className="flex flex-col gap-1">
      <span className="text-label text-neutral-subtle">{label}</span>
      <span className="text-heading-lg font-semibold tabular-nums text-neutral-default">
        {value}
      </span>
      <span className="text-label font-normal tracking-normal text-neutral-subtle">
        {help}
      </span>
    </CardBody>
  </Card>
);

export const ResultStep: React.FC<ResultStepProps> = ({
  model,
  result,
  saving,
  onPrev,
  onSave,
}) => {
  const heaviest = heaviestDimension(result);
  const factor = uncertaintyFactor(result.band.pmMin, result.band.pmMax);
  const totalHeads = result.mix.reduce((a, m) => a + m.people, 0);

  return (
    <StepFrame
      title="Resultado"
      help={`Estimación temprana: ${result.points} de ${result.maxPoints} puntos de complejidad. Se afina con el discovery.`}
      aside={
        <Tag>
          {result.answered} de {result.totalQuestions} respondidas
        </Tag>
      }
      footerText={`Al guardar, la iniciativa queda con talla ${result.talla} y ${fteText(result.fteExpected)} FTE de demanda. Activarla es otro paso.`}
      actions={
        <>
          <Button variant="secondary" onClick={onPrev}>
            Revisar respuestas
          </Button>
          <Button
            variant="primary"
            isLoading={saving}
            onClick={onSave}
            iconBefore={<Icon name="save" size={16} />}
          >
            Guardar evaluación
          </Button>
        </>
      }
    >
      <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Tag color={tallaColor(result.talla)}>{result.talla}</Tag>
            <div className="flex flex-col">
              <span className="text-body font-semibold text-neutral-default">
                {result.band.lectura}
              </span>
              <span className="text-label font-normal tracking-normal text-neutral-subtle">
                Complejidad {pctText(result.pct)} ·{" "}
                {pmText(result.band.pmMin, result.band.pmMax)} PM
              </span>
            </div>
          </div>

          {/* Escala de tallas: las bandas vigentes, a escala, con el puntaje
              encima. tuip no trae una escala así; se compone con tokens y
              queda anotada como brecha. */}
          <div className="flex flex-col gap-1.5" aria-label="Escala de tallas">
            <div className="relative flex h-2.5 overflow-visible rounded-pill">
              {model.bands.map((b) => (
                <span
                  key={b.talla}
                  title={`${b.talla}: ${b.minPct}–${b.maxPct}%`}
                  className={`h-full first:rounded-l-pill last:rounded-r-pill ${
                    b.talla === result.talla
                      ? "bg-neutral-bold"
                      : "bg-neutral-subtle"
                  }`}
                  style={{
                    width: `${b.maxPct - b.minPct + (b.minPct === 0 ? 0 : 1)}%`,
                  }}
                />
              ))}
              <span
                aria-hidden="true"
                className="absolute -translate-x-1/2 rounded-pill border-2 border-neutral-default bg-neutral-bold"
                style={{
                  left: `${result.pct}%`,
                  height: 18,
                  width: 18,
                  top: -4,
                }}
              />
            </div>
            <div className="flex font-mono text-label font-normal tracking-normal text-neutral-subtle">
              {model.bands.map((b) => (
                <span
                  key={b.talla}
                  style={{
                    width: `${b.maxPct - b.minPct + (b.minPct === 0 ? 0 : 1)}%`,
                  }}
                >
                  {b.talla}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label="FTE esperado"
              value={fteText(result.fteExpected)}
              help={`para terminar en ${result.targetMonths} meses`}
              emphasis
            />
            <Stat
              label="Optimista"
              value={fteText(result.fteMin)}
              help="si el alcance no crece"
            />
            <Stat
              label="Pesimista"
              value={fteText(result.fteMax)}
              help={`banda ~${factor}× entre extremos`}
            />
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
            Qué la hace compleja
          </h3>
          <ul className="flex flex-col gap-2.5">
            {result.dimensions.map((d) => (
              <li key={d.dimension} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-neutral-default">{d.dimension}</span>
                  <span className="tabular-nums text-neutral-subtle">
                    {d.pct}%
                  </span>
                </div>
                <Progress value={d.pct} label={d.dimension} />
              </li>
            ))}
          </ul>
          {heaviest.pct > 0 && (
            <Alert variant="warning" title={`${heaviest.dimension} pesa más`}>
              Es la dimensión con más puntaje ({heaviest.pct}%). Ahí conviene
              poner el discovery.
            </Alert>
          )}
        </div>
      </div>
    </StepFrame>
  );
};
