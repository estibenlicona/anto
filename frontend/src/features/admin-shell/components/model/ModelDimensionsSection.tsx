import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Switch,
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
  EstimationQuestionType,
} from "@features/initiatives/services/evaluationModel";
import type { SaveDimensionsRequest } from "../../services/estimationModelService";

export interface ModelDimensionsSectionProps {
  version: EstimationModelVersion;
  editable: boolean;
  saving: boolean;
  onSave: (request: Omit<SaveDimensionsRequest, "author">) => Promise<boolean>;
}

const TYPES: EstimationQuestionType[] = ["Cuantitativa", "Evaluativa", "Binaria"];

/** Desactivar no borra: las estimaciones ya calculadas siguen necesitando la dimensión. */
export const ModelDimensionsSection: React.FC<ModelDimensionsSectionProps> = ({
  version,
  editable,
  saving,
  onSave,
}) => {
  const [dimensions, setDimensions] = useState(version.dimensions);
  const [questions, setQuestions] = useState(version.questions);

  useEffect(() => {
    setDimensions(version.dimensions);
    setQuestions(version.questions);
  }, [version]);

  const save = () =>
    onSave({
      dimensions: dimensions.map((d) => ({ ...d })),
      questions: questions.map((q) => ({
        code: q.id,
        dimensionCode: q.dimension,
        texto: q.text,
        type: q.type,
        unit: q.unit ?? null,
        driverCode: q.driver,
        active: q.active,
        options: q.options.map((o) => ({
          label: o.label,
          score: o.score,
          from: o.from ?? null,
          to: o.to ?? null,
        })),
      })),
      triage: version.triage.map((t) => ({
        code: t.id,
        texto: t.text,
        critical: t.critical,
      })),
    });

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardBody className="flex flex-col gap-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Preguntas</TableHead>
                <TableHead>Activa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...dimensions]
                .sort((a, b) => a.order - b.order)
                .map((dimension) => (
                  <TableRow key={dimension.code}>
                    <TableCell>
                      <span className="font-mono text-body-sm">{dimension.code}</span>
                    </TableCell>
                    <TableCell>
                      {editable ? (
                        <Input
                          aria-label={`Nombre de ${dimension.code}`}
                          value={dimension.name}
                          onChange={(event) =>
                            setDimensions((current) =>
                              current.map((d) =>
                                d.code === dimension.code
                                  ? { ...d, name: event.target.value }
                                  : d
                              )
                            )
                          }
                        />
                      ) : (
                        dimension.name
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-body-sm tabular-nums">
                        {dimension.order}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-body-sm tabular-nums">
                        {questions.filter((q) => q.dimension === dimension.code).length}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={dimension.active}
                        disabled={!editable}
                        label={`Dimensión ${dimension.name} activa`}
                        onCheckedChange={(checked) =>
                          setDimensions((current) =>
                            current.map((d) =>
                              d.code === dimension.code ? { ...d, active: checked } : d
                            )
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Texto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Opciones</TableHead>
                <TableHead>Activa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <span className="font-mono text-body-sm">{question.id}</span>
                  </TableCell>
                  <TableCell>
                    {editable ? (
                      <Input
                        aria-label={`Texto de ${question.id}`}
                        value={question.text}
                        onChange={(event) =>
                          setQuestions((current) =>
                            current.map((q) =>
                              q.id === question.id ? { ...q, text: event.target.value } : q
                            )
                          )
                        }
                      />
                    ) : (
                      <span className="text-body-sm">{question.text}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editable ? (
                      <Select
                        aria-label={`Tipo de ${question.id}`}
                        value={question.type}
                        onValueChange={(value) =>
                          setQuestions((current) =>
                            current.map((q) =>
                              q.id === question.id
                                ? { ...q, type: value as EstimationQuestionType }
                                : q
                            )
                          )
                        }
                        options={TYPES.map((type) => ({ value: type, label: type }))}
                      />
                    ) : (
                      <Tag>{question.type}</Tag>
                    )}
                  </TableCell>
                  <TableCell>
                    {/* Sólo una cuantitativa tiene unidad; en las demás el campo
                        no existe en vez de quedar deshabilitado sin razón. */}
                    {question.type === "Cuantitativa" ? (
                      editable ? (
                        <Input
                          aria-label={`Unidad de ${question.id}`}
                          value={question.unit ?? ""}
                          onChange={(event) =>
                            setQuestions((current) =>
                              current.map((q) =>
                                q.id === question.id ? { ...q, unit: event.target.value } : q
                              )
                            )
                          }
                        />
                      ) : (
                        <span className="text-body-sm">{question.unit ?? "—"}</span>
                      )
                    ) : (
                      <span className="text-body-sm text-neutral-subtle">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-body-sm">{question.driver}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-label text-neutral-subtle"
                      title={question.options.map((o) => o.label).join(" · ")}
                    >
                      {question.options.map((o) => o.label).join(" · ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={question.active}
                      disabled={!editable}
                      label={`Pregunta ${question.id} activa`}
                      onCheckedChange={(checked) =>
                        setQuestions((current) =>
                          current.map((q) =>
                            q.id === question.id ? { ...q, active: checked } : q
                          )
                        )
                      }
                    />
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
