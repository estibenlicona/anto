import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@tuya-ui/components";
import { BandScale } from "@shared/components/BandScale";
import type {
  EstimationModelVersion,
  RiskBand,
  TallaRule,
} from "@features/initiatives/services/evaluationModel";
import type { SaveTallaRulesRequest } from "../../services/estimationModelService";

export interface ModelTallasSectionProps {
  version: EstimationModelVersion;
  editable: boolean;
  saving: boolean;
  onSave: (request: Omit<SaveTallaRulesRequest, "author">) => Promise<boolean>;
}

/** Los cortes interiores salen de los máximos: es un número por frontera, no dos. */
const boundariesOf = (rules: TallaRule[]) => rules.slice(0, -1).map((rule) => rule.maxPct);

const number = (value: number) =>
  value.toLocaleString("es-CO", { maximumFractionDigits: 2 });

export const ModelTallasSection: React.FC<ModelTallasSectionProps> = ({
  version,
  editable,
  saving,
  onSave,
}) => {
  const [rules, setRules] = useState<TallaRule[]>(version.tallaRules);
  const [bands, setBands] = useState<RiskBand[]>(version.riskBands);

  useEffect(() => {
    setRules(version.tallaRules);
    setBands(version.riskBands);
  }, [version]);

  /**
   * Mover un corte mueve las dos tallas que lo comparten: es una frontera, no
   * dos números. Así no hay forma de dejar un hueco desde la pantalla.
   */
  const moveBoundary = (index: number, value: number) =>
    setRules((current) =>
      current.map((rule, i) => {
        if (i === index) return { ...rule, maxPct: value };
        if (i === index + 1) return { ...rule, minPct: value };
        return rule;
      })
    );

  const setField = (talla: string, field: keyof TallaRule, value: string) =>
    setRules((current) =>
      current.map((rule) =>
        rule.talla === talla
          ? {
              ...rule,
              [field]:
                field === "lectura" || field === "action" || field === "talla"
                  ? value
                  : Number(value),
            }
          : rule
      )
    );

  const save = () =>
    onSave({
      boundaries: boundariesOf(rules),
      rules: rules.map((rule) => ({
        talla: rule.talla,
        pmMin: rule.pmMin,
        pmExpected: rule.pmExpected,
        pmMax: rule.pmMax,
        lectura: rule.lectura,
        action: rule.action,
      })),
      riskBands: bands.map((band) => ({ ...band })),
    });

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardBody className="flex flex-col gap-4">
          <BandScale
            label="Reparto del puntaje de tamaño entre las tallas"
            bands={rules.map((rule) => ({
              label: rule.talla,
              from: rule.minPct,
              to: rule.maxPct,
            }))}
          />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Talla</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hasta</TableHead>
                  <TableHead>PM mínimo</TableHead>
                  <TableHead>PM esperado</TableHead>
                  <TableHead>PM máximo</TableHead>
                  <TableHead>Lectura</TableHead>
                  <TableHead>Acción recomendada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule, index) => (
                  <TableRow key={rule.talla}>
                    <TableCell>
                      <span className="font-mono text-body-sm">{rule.talla}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-body-sm tabular-nums text-neutral-subtle">
                        {number(rule.minPct)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {editable && index < rules.length - 1 ? (
                        <Input
                          type="number"
                          aria-label={`Corte entre ${rule.talla} y ${rules[index + 1].talla}`}
                          value={String(rule.maxPct)}
                          onChange={(event) => moveBoundary(index, Number(event.target.value))}
                        />
                      ) : (
                        <span className="font-mono text-body-sm tabular-nums text-neutral-subtle">
                          {number(rule.maxPct)}%
                        </span>
                      )}
                    </TableCell>
                    {(["pmMin", "pmExpected", "pmMax"] as const).map((field) => (
                      <TableCell key={field}>
                        {editable ? (
                          <Input
                            type="number"
                            step="0.1"
                            aria-label={`${field} de ${rule.talla}`}
                            value={String(rule[field])}
                            onChange={(event) => setField(rule.talla, field, event.target.value)}
                          />
                        ) : (
                          <span className="font-mono text-body-sm tabular-nums">
                            {number(rule[field])}
                          </span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      {editable ? (
                        <Input
                          aria-label={`Lectura de ${rule.talla}`}
                          value={rule.lectura}
                          onChange={(event) =>
                            setField(rule.talla, "lectura", event.target.value)
                          }
                        />
                      ) : (
                        <span className="text-body-sm">{rule.lectura}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editable ? (
                        <Input
                          aria-label={`Acción de ${rule.talla}`}
                          value={rule.action}
                          onChange={(event) =>
                            setField(rule.talla, "action", event.target.value)
                          }
                        />
                      ) : (
                        <span className="text-body-sm">{rule.action}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="text-label text-neutral-subtle">
            El esperado es un parámetro propio y no el punto medio del rango: es
            el ancla sobre la que el puntaje de esfuerzo ubica el resultado.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nivel de riesgo</TableHead>
                <TableHead>Hasta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bands.map((band, index) => (
                <TableRow key={band.level}>
                  <TableCell>
                    <span className="text-body-sm">{band.level}</span>
                  </TableCell>
                  <TableCell>
                    {editable ? (
                      <Input
                        type="number"
                        aria-label={`Techo del nivel ${band.level}`}
                        value={String(band.maxPct)}
                        onChange={(event) =>
                          setBands((current) =>
                            current.map((b, i) =>
                              i === index ? { ...b, maxPct: Number(event.target.value) } : b
                            )
                          )
                        }
                      />
                    ) : (
                      <span className="font-mono text-body-sm tabular-nums">
                        {number(band.maxPct)}%
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {editable && (
        <div className="flex justify-end">
          <Button variant="primary" disabled={saving} onClick={() => void save()}>
            Guardar
          </Button>
        </div>
      )}
    </div>
  );
};
