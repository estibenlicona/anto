import React, { useState } from "react";
import { Alert, Button, Card, CardBody, Input, Textarea } from "@tuya-ui/components";
import { ValidationList } from "@shared/components/ValidationList";
import { ValueDiff } from "@shared/components/ValueDiff";
import type {
  ModelEditorSection,
  ModelValidationReport,
  ModelVersionDiff,
} from "../../services/estimationModelService";

export interface ModelPublishSectionProps {
  report: ModelValidationReport | null;
  diff: ModelVersionDiff | null;
  editable: boolean;
  saving: boolean;
  onGoToSection: (section: ModelEditorSection) => void;
  onPublish: (effectiveFrom: string, note: string) => Promise<boolean>;
}

const today = () => new Date().toISOString().slice(0, 10);

export const ModelPublishSection: React.FC<ModelPublishSectionProps> = ({
  report,
  diff,
  editable,
  saving,
  onGoToSection,
  onPublish,
}) => {
  const [effectiveFrom, setEffectiveFrom] = useState(today);
  const [note, setNote] = useState("");
  const [attempted, setAttempted] = useState(false);

  const impediments = report?.impedimentCount ?? 0;
  const blocked = impediments > 0;

  const publish = async () => {
    setAttempted(true);
    if (!note.trim()) return;
    await onPublish(effectiveFrom, note.trim());
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardBody className="flex flex-col gap-3">
          {report ? (
            <ValidationList
              label="Validación de la versión"
              items={report.checks.map((check) => ({
                id: check.code,
                title: check.title,
                status: check.status,
                missing: check.missing,
              }))}
              onGoTo={(item) => {
                const check = report.checks.find((c) => c.code === item.id);
                if (check) onGoToSection(check.section);
              }}
            />
          ) : (
            <p className="text-body-sm text-neutral-subtle">Cargando la validación…</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          {!diff || diff.entries.length === 0 ? (
            <p className="text-body-sm text-neutral-subtle">
              {diff?.fromVersion
                ? `Sin cambios respecto de la versión ${diff.fromVersion}.`
                : "No hay una versión vigente con la que comparar."}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {diff.entries.map((entry) => (
                <li
                  key={`${entry.section}-${entry.item}`}
                  className="flex flex-col gap-1 border-b border-neutral-default pb-2 last:border-b-0 last:pb-0"
                >
                  <span className="text-body-sm text-neutral-default">{entry.item}</span>
                  <ValueDiff
                    before={entry.before}
                    after={entry.after}
                    kind={entry.kind}
                    label={entry.item}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {editable && (
        <Card>
          <CardBody className="flex flex-col gap-4">
            <Input
              type="date"
              label="Vigente desde"
              value={effectiveFrom}
              onChange={(event) => setEffectiveFrom(event.target.value)}
            />
            <Textarea
              label="Nota de cambio"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              error={attempted && !note.trim() ? "Publicar exige decir qué cambió." : undefined}
            />

            {blocked && (
              <Alert variant="warning">
                Quedan {impediments} {impediments === 1 ? "impedimento" : "impedimentos"} por
                resolver.
              </Alert>
            )}

            <div className="flex justify-end">
              {/* Deshabilitado y diciendo por qué: un botón gris sin explicación
                  obliga a adivinar qué falta. */}
              <Button
                variant="primary"
                disabled={blocked || saving}
                onClick={() => void publish()}
              >
                {blocked
                  ? `Faltan ${impediments} ${impediments === 1 ? "impedimento" : "impedimentos"}`
                  : "Publicar versión"}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
