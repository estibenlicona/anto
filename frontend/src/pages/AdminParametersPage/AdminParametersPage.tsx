import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
  Tag,
  type TagColor,
} from "@tuya-ui/components";
import { AdminPageHeader } from "@features/admin-shell/components/AdminPageHeader";
import {
  actionFor,
  hasCurrentVersion,
  useEstimationModels,
} from "@features/admin-shell/hooks/useEstimationModels";
import type {
  EstimationModelListItem,
  ModelEditorSection,
  ModelVersionListItem,
  ModelVersionStatus,
} from "@features/admin-shell/services/estimationModelService";
import { modelVersionPath } from "@features/admin-shell/adapters/ParametersRoutes";

/**
 * El color acompaña al estado — no lo ordena ni lo califica. Vive en la pantalla
 * porque es presentación: qué color le toca a un borrador no es un dato del
 * modelo de estimación.
 */
const STATUS_COLORS: Record<ModelVersionStatus, TagColor> = {
  Borrador: "amber",
  Vigente: "green",
  Archivada: "gray",
};

const formatDate = (value: string | null) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export const AdminParametersPage: React.FC = () => {
  const navigate = useNavigate();
  const { models, loading, error, creating, createVersionFrom } = useEstimationModels();

  const openNewVersion = async (modelId: string, source: number) => {
    const created = await createVersionFrom(modelId, source);
    if (created !== null) navigate(modelVersionPath(modelId, created));
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Parámetros del modelo" />

      {error && <Alert variant="danger">{error}</Alert>}

      {loading && models.length === 0 && (
        <Card>
          <CardBody>
            <p className="text-body-sm text-neutral-subtle">Cargando modelos…</p>
          </CardBody>
        </Card>
      )}

      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          busy={creating}
          onOpen={(version, section) => navigate(modelVersionPath(model.id, version, section))}
          onCreateFrom={(source) => void openNewVersion(model.id, source)}
        />
      ))}
    </div>
  );
};

interface ModelCardProps {
  model: EstimationModelListItem;
  busy: boolean;
  onOpen: (version: number, section?: ModelEditorSection) => void;
  onCreateFrom: (sourceVersion: number) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, busy, onOpen, onCreateFrom }) => (
  <Card>
    <CardBody className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="text-body font-semibold text-neutral-default">{model.name}</span>
          <Tag>Fase {model.phase}</Tag>
        </span>
        {!hasCurrentVersion(model) && (
          // Un modelo sin vigente no sirve para estimar, y decirlo acá evita
          // que alguien lo descubra recién al abrir una iniciativa.
          <Tag color="red">Sin versión vigente</Tag>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Versión</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Vigencia</TableHead>
            <TableHead>Estimaciones</TableHead>
            <TableHead>Nota de cambio</TableHead>
            <TableHead>
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {model.versions.map((version) => (
            <VersionRow
              key={version.id}
              version={version}
              busy={busy}
              onOpen={onOpen}
              onCreateFrom={onCreateFrom}
            />
          ))}
        </TableBody>
      </Table>
    </CardBody>
  </Card>
);

interface VersionRowProps {
  version: ModelVersionListItem;
  busy: boolean;
  onOpen: (version: number, section?: ModelEditorSection) => void;
  onCreateFrom: (sourceVersion: number) => void;
}

const VersionRow: React.FC<VersionRowProps> = ({ version, busy, onOpen, onCreateFrom }) => {
  const action = actionFor(version);

  return (
    <TableRow>
      <TableCell>
        <span className="font-mono text-body-sm tabular-nums">v{version.number}</span>
      </TableCell>
      <TableCell>
        <Tag color={STATUS_COLORS[version.status]}>{version.status}</Tag>
      </TableCell>
      <TableCell>
        <span className="font-mono text-label tabular-nums text-neutral-subtle">
          {formatDate(version.effectiveFrom)}
          {version.effectiveTo ? ` – ${formatDate(version.effectiveTo)}` : ""}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-body-sm tabular-nums">
          {version.estimationsCount.toLocaleString("es-CO")}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-body-sm text-neutral-subtle">{version.changeNote ?? "—"}</span>
      </TableCell>
      <TableCell>
        <span className="flex justify-end gap-2">
          {action === "edit" && (
            <Button
              variant="primary"
              size="small"
              onClick={() => onOpen(version.number)}
              iconAfter={<Icon name="chevron-right" size={16} />}
            >
              Seguir editando
            </Button>
          )}
          {action !== "edit" && (
            <>
              <Button variant="subtle" size="small" onClick={() => onOpen(version.number)}>
                Ver
              </Button>
              {/* Una versión publicada no ofrece "editar" en gris: ofrece la
                  única salida que tiene. */}
              {action === "createFrom" && (
                <Button
                  variant="secondary"
                  size="small"
                  disabled={busy}
                  onClick={() => onCreateFrom(version.number)}
                >
                  Crear versión nueva
                </Button>
              )}
            </>
          )}
        </span>
      </TableCell>
    </TableRow>
  );
};
