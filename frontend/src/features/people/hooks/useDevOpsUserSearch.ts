import { useCallback, useState } from "react";
import {
  personDetailService,
  type DevOpsUserDto,
} from "../services/personDetailService";

export type DevOpsUserSearchStatus =
  "idle" | "searching" | "found" | "notFound" | "error";

export interface DevOpsUserSearchState {
  status: DevOpsUserSearchStatus;
  /** El correo con el que se hizo la última búsqueda; `null` en reposo. */
  searchedEmail: string | null;
  user: DevOpsUserDto | null;
  error: string | null;
}

const IDLE: DevOpsUserSearchState = {
  status: "idle",
  searchedEmail: null,
  user: null,
  error: null,
};

function httpStatusOf(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

/**
 * La búsqueda de un usuario de Azure DevOps por correo, como máquina de
 * estados: en reposo, buscando, encontrado, sin coincidencia o con error.
 *
 * Vive fuera del drawer para poder probar cada estado sin montarlo, y para
 * que el drawer sólo decida qué mostrar. Un `404` no es una falla: es la
 * respuesta normal a "nadie tiene ese correo", y por eso tiene su propio
 * estado en vez de compartir el de error.
 */
export const useDevOpsUserSearch = () => {
  const [state, setState] = useState<DevOpsUserSearchState>(IDLE);

  const search = useCallback(async (email: string) => {
    setState({
      status: "searching",
      searchedEmail: email,
      user: null,
      error: null,
    });
    try {
      const user = await personDetailService.searchDevOpsUser(email);
      setState({ status: "found", searchedEmail: email, user, error: null });
    } catch (err) {
      if (httpStatusOf(err) === 404) {
        setState({
          status: "notFound",
          searchedEmail: email,
          user: null,
          error: null,
        });
        return;
      }
      setState({
        status: "error",
        searchedEmail: email,
        user: null,
        error:
          err instanceof Error && err.message
            ? err.message
            : "No se pudo consultar Azure DevOps",
      });
    }
  }, []);

  const reset = useCallback(() => setState(IDLE), []);

  return { ...state, search, reset };
};
