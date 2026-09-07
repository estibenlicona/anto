import React, { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Input,
  useToast,
} from "@tuya-ui/components";
import { AdminPageHeader } from "@features/admin-shell/components/AdminPageHeader";
import { useDedicationSync } from "@features/dedication/hooks/useDedicationSync";
import { syncedAtLabel } from "@features/dedication/adapters/DedicationAdapter";

const pipeline = [
  { title: "Azure DevOps", detail: "fuente externa" },
  { title: "Job de ingesta", detail: "backend · diario 02:00" },
  { title: "Base local (espejo)", detail: "boards · items · identidades" },
  { title: "API de la plataforma", detail: "lo único que ve el front" },
];

const conexion = [
  { label: "Estado", value: <Badge variant="success">Conectado</Badge> },
  { label: "Permisos", value: "Work Items (Read) · Boards (Read)" },
  { label: "Dirección", value: "Solo lectura · DevOps → Plataforma" },
];

// "Última ejecución" se muestra aparte porque es el único dato real de esta
// pantalla — el resto sigue siendo de ejemplo hasta que exista un espejo
// local real de boards/work items/identidades.
const jobStatus = [
  { label: "Próxima programada", value: "Mañana 02:00" },
  { label: "Tableros espejados", value: "14" },
  { label: "Work items espejados", value: "1.240" },
  { label: "Identidades espejadas", value: "238" },
  {
    label: "Novedades última corrida",
    value: "+3 nuevos · 2 cambios → curación",
  },
];

export const AdminDevOpsPage: React.FC = () => {
  const { toast } = useToast();
  const sync = useDedicationSync();
  // Ejemplo inicial hasta la primera ingesta real de la sesión — el resto de
  // "Job de ingesta diaria" sigue siendo de ejemplo (ver comentario de jobStatus).
  const [lastIngestedAt, setLastIngestedAt] = useState<string | null>(null);

  const handleIngest = async () => {
    const result = await sync.syncAll();
    if (result.success && result.lastSyncedAt) {
      setLastIngestedAt(result.lastSyncedAt);
      toast({
        message: "Actualizado desde Azure DevOps",
        icon: <Icon name="status-success" size={16} />,
      });
    }
  };

  return (
    <div>
      <AdminPageHeader title="Integración con Azure DevOps" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {pipeline.map((step, index) => (
          <React.Fragment key={step.title}>
            <div className="min-w-[150px] flex-1 rounded-control border border-neutral-default bg-neutral-subtlest px-3 py-2.5">
              <div className="text-body-sm font-semibold text-neutral-default">
                {step.title}
              </div>
              <div className="text-body-sm text-neutral-subtle">
                {step.detail}
              </div>
            </div>
            {index < pipeline.length - 1 && (
              <Icon
                name="chevron-right"
                size={16}
                className="shrink-0 text-neutral-subtle"
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>Conexión</CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Organización"
                defaultValue="https://dev.azure.com/tuya"
                readOnly
                disabled
              />
              <Input
                label="Proyecto"
                defaultValue="Ecosistema-Digital"
                readOnly
                disabled
              />
              <Input
                label="Autenticación"
                defaultValue="Service Principal (Entra ID)"
                readOnly
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              {conexion.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-body-sm"
                >
                  <span className="text-neutral-subtle">{row.label}</span>
                  <span className="font-medium text-neutral-default">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="secondary" disabled className="self-start">
              Probar conexión
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>Job de ingesta diaria</CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-neutral-subtle">Última ejecución</span>
                <span className="font-medium text-neutral-default">
                  {lastIngestedAt
                    ? syncedAtLabel(lastIngestedAt)
                    : "Hoy 02:00 · OK"}
                </span>
              </div>
              {jobStatus.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-body-sm"
                >
                  <span className="text-neutral-subtle">{row.label}</span>
                  <span className="font-medium text-neutral-default">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <Button
              variant="primary"
              isLoading={sync.syncing}
              onClick={handleIngest}
              className="self-start"
            >
              {sync.syncing ? "Ejecutando…" : "Ejecutar ingesta ahora"}
            </Button>
            {sync.error && (
              <Alert
                variant="danger"
                title="No se pudo ejecutar la ingesta"
                action={
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleIngest}
                    isLoading={sync.syncing}
                  >
                    Reintentar
                  </Button>
                }
              >
                {sync.error}
              </Alert>
            )}
            <Alert variant="info">
              Las novedades con asignación entran a la bandeja de curación. Un
              cambio de asignación en un item ya curado lo devuelve a curación.
            </Alert>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
