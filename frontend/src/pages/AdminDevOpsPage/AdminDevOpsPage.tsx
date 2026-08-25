import React from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Input,
} from "@tuya-ui/components";
import { AdminPageHeader } from "@features/admin-shell/components/AdminPageHeader";

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

const jobStatus = [
  { label: "Última ejecución", value: "Hoy 02:00 · OK" },
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
              <Input
                label="Secreto"
                type="password"
                defaultValue="••••••••••••"
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
            <Button variant="primary" disabled className="self-start">
              Ejecutar ingesta ahora
            </Button>
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
