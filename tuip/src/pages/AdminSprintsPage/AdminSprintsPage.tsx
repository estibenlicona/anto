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

const fieldMeta: { field: keyof SprintConfig; label: string }[] = [
  { field: "weeks", label: "Semanas por sprint" },
  { field: "hoursPerWeek", label: "Horas por semana" },
  { field: "sprintsPerQuarter", label: "Sprints por quarter" },
  { field: "toleranceHours", label: "Tolerancia de reporte (± h)" },
];

const usedBy = [
  {
    title: "Reporte de horas por sprint",
    detail: "Valida el total contra horas ± tolerancia",
  },
  {
    title: "Dashboard de capacidad",
    detail: "Convierte horas → FTE con la duración vigente",
  },
  { title: "Roadmap", detail: "Posiciona iniciativas por sprint y quarter" },
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
                <div className="grid gap-4 sm:grid-cols-2">
                  {fieldMeta.map(({ field, label }) => (
                    <Input
                      key={field}
                      type="number"
                      label={label}
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
