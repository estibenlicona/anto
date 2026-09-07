import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Input,
  useToast,
} from "@tuya-ui/components";
import { AdminPageHeader } from "@features/admin-shell/components/AdminPageHeader";
import { useSprintConfig } from "@features/admin-shell/hooks/useSprintConfig";
import type { SprintConfig } from "@features/admin-shell/services/sprintConfigService";

// Sólo lo que define el calendario: las horas por semana y la tolerancia de
// reporte se fueron con el registro de horas, y los puntos por FTE con el
// balance de carga —el FTE mide capacidad y los SP demanda, sin conversión—.
const fieldMeta: {
  field: keyof SprintConfig;
  label: string;
  type: "number" | "time";
  hint?: string;
}[] = [
  { field: "weeks", label: "Semanas por sprint", type: "number" },
  { field: "sprintsPerQuarter", label: "Sprints por quarter", type: "number" },
  {
    field: "hoursPerSprint",
    label: "Horas por sprint",
    type: "number",
    hint: "Con cuántas horas se expresa la capacidad; nadie las reporta",
  },
  {
    field: "sprintCloseTime",
    label: "Hora de cierre del sprint",
    type: "time",
    hint: "Cuándo se sella el snapshot, antes de que los equipos limpien las HUs",
  },
  {
    field: "historyWindowSprints",
    label: "Ventana de histórico",
    type: "number",
    hint: "Sprints sellados que entran en la mediana y la tendencia",
  },
  {
    field: "minHistorySprints",
    label: "Mínimo de sprints para evaluar",
    type: "number",
    hint: "Por debajo, la señal de balance es «No evaluable»",
  },
];

const usedBy = [
  { title: "Roadmap", detail: "Posiciona iniciativas por sprint y quarter" },
  {
    title: "Capacidad",
    detail:
      "Decide cuándo sellar el snapshot de cada sprint, sobre qué ventana calcula el histórico y la señal de balance, y con cuántas horas expresa la capacidad",
  },
];

export const AdminSprintsPage: React.FC = () => {
  const { values, errors, loading, saving, canSave, setField, save } =
    useSprintConfig();
  const { toast } = useToast();

  const handleSave = async () => {
    const result = await save();
    if (result.success) {
      toast({
        message: "Configuración guardada",
        icon: <Icon name="status-success" size={16} />,
      });
    } else if (result.error) {
      toast({
        message: result.error,
        icon: <Icon name="status-error" size={16} />,
      });
    }
  };

  return (
    <div>
      <AdminPageHeader title="Calendario de sprints" />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>Parámetros del sprint</CardHeader>
          <CardBody>
            {loading || !values ? (
              <p className="text-body-sm text-neutral-subtle">
                Cargando configuración…
              </p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  {fieldMeta.map(({ field, label, type, hint }) => (
                    <Input
                      key={field}
                      type={type}
                      label={label}
                      hint={hint}
                      value={values[field]}
                      error={errors[field]}
                      onChange={(e) => setField(field, e.target.value)}
                    />
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <Button
                    variant="primary"
                    disabled={!canSave}
                    onClick={handleSave}
                  >
                    {saving ? "Guardando…" : "Guardar configuración"}
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>¿Qué usa este calendario?</CardHeader>
          <CardBody className="flex flex-col gap-3">
            {usedBy.map((item) => (
              <div key={item.title} className="flex items-start gap-2.5">
                <Icon
                  name="status-success"
                  size={20}
                  className="mt-0.5 shrink-0 text-success-default"
                />
                <div>
                  <div className="text-body-sm font-medium text-neutral-default">
                    {item.title}
                  </div>
                  <div className="text-body-sm text-neutral-subtle">
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
