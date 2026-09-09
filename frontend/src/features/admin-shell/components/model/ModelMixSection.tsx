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
  Tag,
} from "@tuya-ui/components";
import type {
  EstimationModelVersion,
  MixRow,
} from "@features/initiatives/services/evaluationModel";
import type { SaveMixRequest } from "../../services/estimationModelService";

export interface ModelMixSectionProps {
  version: EstimationModelVersion;
  editable: boolean;
  saving: boolean;
  onSave: (request: Omit<SaveMixRequest, "author">) => Promise<boolean>;
}

const number = (value: number) =>
  value.toLocaleString("es-CO", { maximumFractionDigits: 2 });

/** Lo que suma una columna. Es lo único que hay que mirar para saber si cierra. */
const totalFor = (mix: MixRow[], talla: string) =>
  Math.round(mix.reduce((sum, row) => sum + (row.byTalla[talla] ?? 0), 0) * 100) / 100;

export const ModelMixSection: React.FC<ModelMixSectionProps> = ({
  version,
  editable,
  saving,
  onSave,
}) => {
  const [mix, setMix] = useState<MixRow[]>(version.mix);

  useEffect(() => setMix(version.mix), [version]);

  const tallas = version.tallaRules.map((rule) => rule.talla);

  const setCell = (capability: string, talla: string, value: number) =>
    setMix((current) =>
      current.map((row) =>
        row.capability === capability
          ? { ...row, byTalla: { ...row.byTalla, [talla]: value } }
          : row
      )
    );

  const save = () =>
    onSave({
      mix: mix.map((row) => ({
        key: row.capability,
        capacidad: row.capability,
        porTalla: { ...row.byTalla },
      })),
      modifiers: version.mixModifiers.map((modifier) => ({
        code: modifier.code,
        driverCode: modifier.driver,
        operator: modifier.operator,
        threshold: modifier.value,
        tallas: [...modifier.tallas],
        adjustments: modifier.adjustments.map((a) => ({
          capabilityKey: a.capability,
          points: a.points,
        })),
      })),
    });

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardBody className="flex flex-col gap-3">
          <p className="text-label text-neutral-subtle">
            El porcentaje es la participación del perfil en el esfuerzo de la
            iniciativa. Cada columna suma 100: el mix describe demanda de
            perfiles, no cantidad de personas.
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capacidad</TableHead>
                  {tallas.map((talla) => (
                    <TableHead key={talla}>{talla}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mix.map((row) => (
                  <TableRow key={row.capability}>
                    <TableCell>
                      <span className="text-body-sm">{row.capability}</span>
                    </TableCell>
                    {tallas.map((talla) => (
                      <TableCell key={talla}>
                        {editable ? (
                          <Input
                            type="number"
                            step="0.01"
                            aria-label={`${row.capability} en ${talla}`}
                            value={String(row.byTalla[talla] ?? 0)}
                            onChange={(event) =>
                              setCell(row.capability, talla, Number(event.target.value))
                            }
                          />
                        ) : (
                          <span className="font-mono text-body-sm tabular-nums">
                            {number(row.byTalla[talla] ?? 0)}%
                          </span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <span className="text-body-sm font-semibold">Total</span>
                  </TableCell>
                  {tallas.map((talla) => {
                    const total = totalFor(mix, talla);
                    return (
                      <TableCell key={talla}>
                        {/* Una columna que no cierra se marca acá y no recién
                            al intentar publicar. */}
                        <Tag color={total === 100 ? "green" : "red"}>{number(total)}%</Tag>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          {version.mixModifiers.length === 0 ? (
            <p className="text-body-sm text-neutral-subtle">
              Sin modificadores: la composición depende sólo de la talla.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Se dispara cuando</TableHead>
                  <TableHead>Tallas</TableHead>
                  <TableHead>Reparte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {version.mixModifiers.map((modifier) => (
                  <TableRow key={modifier.code}>
                    <TableCell>
                      <span className="font-mono text-body-sm">{modifier.code}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-body-sm">
                        {modifier.driver} {modifier.operator === "gte" ? "≥" : "≤"}{" "}
                        {number(modifier.value)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex flex-wrap gap-1">
                        {modifier.tallas.map((talla) => (
                          <Tag key={talla}>{talla}</Tag>
                        ))}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-label tabular-nums">
                        {modifier.adjustments
                          .map(
                            (a) =>
                              `${a.capability} ${a.points > 0 ? "+" : ""}${number(a.points)}`
                          )
                          .join(" · ")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
