import { modulePath } from "@shared/services/modulePath";
import type { ModelEditorSection } from "../services/estimationModelService";

/**
 * Las rutas de Parámetros, definidas una sola vez.
 *
 * El patrón y el constructor viven juntos porque separarlos ya falló: la
 * pantalla armaba `admin/parametros/…` mientras la tabla de rutas declaraba
 * `parametros/…`, y el enlace caía en Not found. Un test que monte su propio
 * router puede repetir el mismo error sin notarlo, así que lo que no puede
 * discrepar es lo que se declara una vez.
 */

/** Relativo a la base del módulo, tal como lo declara la tabla de rutas. */
export const PARAMETERS_ROUTE = "parametros";

export const MODEL_VERSION_ROUTE = "parametros/:modeloId/:version/:seccion";

export const parametersPath = () => modulePath(PARAMETERS_ROUTE);

export const modelVersionPath = (
  modelId: string,
  version: number,
  section: ModelEditorSection = "dimensiones"
) => modulePath(`${PARAMETERS_ROUTE}/${modelId}/${version}/${section}`);
