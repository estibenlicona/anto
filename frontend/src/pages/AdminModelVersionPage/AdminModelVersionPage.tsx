import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, CardBody, Tag } from "@tuya-ui/components";
import { AdminPageHeader } from "@features/admin-shell/components/AdminPageHeader";
import { ModelDimensionsSection } from "@features/admin-shell/components/model/ModelDimensionsSection";
import { ModelDriversSection } from "@features/admin-shell/components/model/ModelDriversSection";
import { ModelHistorySection } from "@features/admin-shell/components/model/ModelHistorySection";
import { ModelMixSection } from "@features/admin-shell/components/model/ModelMixSection";
import { ModelPublishSection } from "@features/admin-shell/components/model/ModelPublishSection";
import { ModelSectionNav } from "@features/admin-shell/components/model/ModelSectionNav";
import { ModelTallasSection } from "@features/admin-shell/components/model/ModelTallasSection";
import { useModelVersion } from "@features/admin-shell/hooks/useModelVersion";
import {
  MODEL_EDITOR_SECTIONS,
  type ModelEditorSection,
} from "@features/admin-shell/services/estimationModelService";
import {
  modelVersionPath,
  parametersPath,
} from "@features/admin-shell/adapters/ParametersRoutes";

const isSection = (value: string | undefined): value is ModelEditorSection =>
  MODEL_EDITOR_SECTIONS.includes(value as ModelEditorSection);

/**
 * El editor de una versión: la barra de contexto y las cinco secciones, con una
 * visible a la vez.
 *
 * La sección es un segmento de ruta y no estado local para que el botón de un
 * impedimento pueda llevar a donde se corrige con un enlace, y para que
 * recargar abra donde estaba (design.md — D8).
 */
export const AdminModelVersionPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ modeloId: string; version: string; seccion: string }>();

  const modelId = params.modeloId ?? "";
  const versionNumber = Number(params.version ?? 0);
  const section: ModelEditorSection = isSection(params.seccion)
    ? params.seccion
    : "dimensiones";

  const {
    version,
    status,
    report,
    diff,
    history,
    loading,
    saving,
    error,
    unpublishedChanges,
    editable,
    saveDimensions,
    saveDrivers,
    saveTallaRules,
    saveMix,
    publish,
  } = useModelVersion(modelId, versionNumber);

  const goTo = (next: ModelEditorSection) =>
    navigate(modelVersionPath(modelId, versionNumber, next));

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader title={`Versión ${versionNumber} del modelo de estimación`} />

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex flex-wrap items-center gap-2">
            <Button
              variant="link"
              size="small"
              onClick={() => navigate(parametersPath())}
            >
              Parámetros del modelo
            </Button>
            <span className="text-body font-semibold text-neutral-default">
              Versión {versionNumber}
            </span>
            {status && <Tag>{status}</Tag>}
            {editable && (
              <span className="text-label text-neutral-subtle">
                {unpublishedChanges === 0
                  ? "Sin cambios sin publicar"
                  : `${unpublishedChanges} ${
                      unpublishedChanges === 1 ? "cambio" : "cambios"
                    } sin publicar`}
              </span>
            )}
          </span>

          {!editable && status && (
            // Se niega la edición y se ofrece la salida en el mismo lugar.
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate(parametersPath())}
            >
              Crear una versión nueva a partir de ésta
            </Button>
          )}
        </CardBody>
      </Card>

      <ModelSectionNav
        active={section}
        onSelect={goTo}
        impediments={report?.impedimentCount ?? 0}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {loading && !version && (
        <Card>
          <CardBody>
            <p className="text-body-sm text-neutral-subtle">Cargando la versión…</p>
          </CardBody>
        </Card>
      )}

      {version && section === "dimensiones" && (
        <ModelDimensionsSection
          version={version}
          editable={editable}
          saving={saving}
          onSave={saveDimensions}
        />
      )}

      {version && section === "drivers" && (
        <ModelDriversSection
          version={version}
          editable={editable}
          saving={saving}
          onSave={saveDrivers}
        />
      )}

      {version && section === "tallas" && (
        <ModelTallasSection
          version={version}
          editable={editable}
          saving={saving}
          onSave={saveTallaRules}
        />
      )}

      {version && section === "mix" && (
        <ModelMixSection
          version={version}
          editable={editable}
          saving={saving}
          onSave={saveMix}
        />
      )}

      {version && section === "publicar" && (
        <>
          <ModelPublishSection
            report={report}
            diff={diff}
            editable={editable}
            saving={saving}
            onGoToSection={goTo}
            onPublish={publish}
          />
          <ModelHistorySection entries={history} />
        </>
      )}
    </div>
  );
};
