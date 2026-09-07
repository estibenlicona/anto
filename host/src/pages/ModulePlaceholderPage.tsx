import React from "react";
import { Alert } from "@tuya-ui/components";
import type { ModuleDefinition } from "@features/modules/registry";

/**
 * Lo que se ve bajo la barra mientras el módulo no está integrado al host.
 * Cuando se cablee Module Federation, esta ruta pasa a montar el remote.
 */
export const ModulePlaceholderPage: React.FC<{ module: ModuleDefinition }> = ({
  module,
}) => (
  <Alert variant="info" title={`${module.name} está pendiente de integrar`}>
    El host ya reconoce este módulo y su ruta ({module.basePath}), pero su
    contenido todavía no se monta acá. Se integra cuando el módulo se publique
    como remote.
  </Alert>
);
