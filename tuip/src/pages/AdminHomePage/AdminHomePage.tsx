import React from "react";
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import { AdminPageHeader } from "@features/admin-shell/components/AdminPageHeader";

const kpis = [
  { label: "Tableros espejados", value: "14" },
  { label: "Work items espejados", value: "1.240" },
  { label: "Identidades espejadas", value: "238" },
  { label: "Última ingesta · hoy 02:00", value: "OK" },
];

const configuracionVigente = [
  {
    parametro: "Calendario de sprints",
    donde: "Calendario de sprints",
    estado: "Configurado",
    variant: "success" as const,
  },
  {
    parametro: "Conexión Azure DevOps",
    donde: "Integración DevOps",
    estado: "Conectado",
    variant: "success" as const,
  },
  {
    parametro: "Parámetros del modelo",
    donde: "Parámetros del modelo",
    estado: "Default",
    variant: "neutral" as const,
  },
  {
    parametro: "Identidades Entra ID",
    donde: "Integración DevOps",
    estado: "1 sin match",
    variant: "warning" as const,
  },
];

const authPipeline = [
  "Frontend · OAuth 2.0 / OIDC",
  "APIM · expone servicios de AKS",
  "Entra ID · identidades federadas",
];

export const AdminHomePage: React.FC = () => {
  return (
    <div>
      <AdminPageHeader title="Estado de la plataforma" />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardBody>
              <div className="text-2xl font-semibold text-neutral-default">
                {kpi.value}
              </div>
              <div className="mt-1 text-body-sm text-neutral-subtle">
                {kpi.label}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>Configuración vigente</CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parámetro</TableHead>
                <TableHead>Dónde</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configuracionVigente.map((row) => (
                <TableRow key={row.parametro}>
                  <TableCell>{row.parametro}</TableCell>
                  <TableCell>{row.donde}</TableCell>
                  <TableCell>
                    <Badge variant={row.variant}>{row.estado}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <CardHeader>Autenticación y autorización</CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {authPipeline.map((step, index) => (
                <React.Fragment key={step}>
                  <span className="rounded-control border border-neutral-default bg-neutral-subtlest px-3 py-2 text-body-sm">
                    {step}
                  </span>
                  {index < authPipeline.length - 1 && (
                    <Icon name="chevron-right" size={16} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <Alert variant="warning">
              La autenticación es externa al backend por diseño. La autorización
              de negocio (qué puede hacer un Chapter Lead) sí es del dominio,
              pero está pendiente decidir si viene como claims desde APIM/Entra
              ID o como tabla de roles local.
            </Alert>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
