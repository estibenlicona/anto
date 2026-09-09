import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
  Tag,
} from "@tuya-ui/components";
import { MatrixNumberCell } from "@shared/components/MatrixNumberCell";
import type {
  EstimationModelVersion,
  EstimationOutput,
  ModelQuestion,
} from "@features/initiatives/services/evaluationModel";
import type { SaveDriversRequest } from "../../services/estimationModelService";

export interface ModelDriversSectionProps {
  version: EstimationModelVersion;
  editable: boolean;
  saving: boolean;
  onSave: (request: Omit<SaveDriversRequest, "author">) => Promise<boolean>;
}

/** El mix es un eje, no un resultado: alimenta a los modificadores de composición. */
const OUTPUTS: { id: EstimationOutput; label: string }[] = [
  { id: "Size", label: "Tamaño" },
  { id: "Effort", label: "Esfuerzo" },
  { id: "Risk", label: "Riesgo" },
  { id: "Mix", label: "Mix" },
];

export const ModelDriversSection: React.FC<ModelDriversSectionProps> = ({
  version,
  editable,
  saving,
  onSave,
}) => {
  const [questions, setQuestions] = useState<ModelQuestion[]>(version.questions);

  useEffect(() => setQuestions(version.questions), [version]);

  const setWeight = (id: string, output: EstimationOutput, value: number | undefined) =>
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== id) return question;
        const weights = { ...question.weights };
        // Quitar la clave es "no aporta". Ponerla en cero es otra cosa, y el
        // motor las distingue.
        if (value === undefined) delete weights[output];
        else weights[output] = value;
        return { ...question, weights };
      })
    );

  const save = () =>
    onSave({
      drivers: version.drivers.map((d) => ({
        code: d.code,
        description: d.description,
        outputs: [...d.outputs],
      })),
      weights: questions.map((q) => ({ questionCode: q.id, weights: { ...q.weights } })),
    });

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardBody className="flex flex-col gap-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Actúa sobre</TableHead>
                <TableHead>Lo alimentan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {version.drivers.map((driver) => {
                const feeding = questions.filter((q) => q.driver === driver.code && q.active);
                return (
                  <TableRow key={driver.code}>
                    <TableCell>
                      <span className="font-mono text-body-sm">{driver.code}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-body-sm">{driver.description}</span>
                    </TableCell>
                    <TableCell>
                      <span className="flex flex-wrap gap-1">
                        {driver.outputs.map((output) => (
                          <Tag key={output}>
                            {OUTPUTS.find((o) => o.id === output)?.label ?? output}
                          </Tag>
                        ))}
                      </span>
                    </TableCell>
                    <TableCell>
                      {feeding.length === 0 ? (
                        // Un driver huérfano no mueve nada: la validación lo
                        // marca, y acá se ve por qué.
                        <Tag color="red">Sin preguntas</Tag>
                      ) : (
                        <span className="font-mono text-label text-neutral-subtle">
                          {feeding.map((q) => q.id).join(", ")}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <p className="text-label text-neutral-subtle">
            Un guion es «no aporta a esa salida». No es un cero: una pregunta que
            no aporta queda fuera del máximo, una que pesa cero le suma cero.
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pregunta</TableHead>
                  <TableHead>Driver</TableHead>
                  {OUTPUTS.map((output) => (
                    <TableHead key={output.id}>{output.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <span className="font-mono text-body-sm">{question.id}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-body-sm">{question.driver}</span>
                    </TableCell>
                    {OUTPUTS.map((output) => (
                      <TableCell key={output.id}>
                        <MatrixNumberCell
                          value={question.weights[output.id]}
                          label={`${question.id} en ${output.label}`}
                          onChange={
                            editable
                              ? (value) => setWeight(question.id, output.id, value)
                              : undefined
                          }
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
