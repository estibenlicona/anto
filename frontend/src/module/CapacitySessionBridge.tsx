import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { AuthContext } from "@app/providers/AuthContext";
import {
  deriveAuthSession,
  mapCapacityRoles,
  type CapacityPermission,
  type Session,
} from "@features/auth-session";
import {
  CAPACITY_API_SCOPES,
  decodeJwtPayload,
  type CapacityModuleProps,
  type HostProvidedSession,
} from "./contract";

/**
 * Une la sesión del host con los permisos de sección del módulo.
 *
 * El host sabe quién es la persona y sus roles de plataforma; los permisos
 * de sección viven en el token de **nuestra** API (`api://capacidad`), que se
 * pide acá con el `acquireToken` del contrato y se vuelve a pedir en cada
 * cambio de sesión. Mientras el primer token de una sesión está en vuelo, el
 * contrato reporta `isLoading` para que los guards no concluyan "sin
 * permisos" sobre un estado a medio resolver.
 */
export const CapacitySessionBridge: React.FC<
  Pick<CapacityModuleProps, "source" | "acquireToken"> & {
    children: React.ReactNode;
  }
> = ({ source, acquireToken, children }) => {
  const subscribe = useCallback(
    (onChange: () => void) => source.subscribe(onChange),
    [source]
  );
  const getSnapshot = useCallback(() => source.getSession(), [source]);
  const hostSession = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Los permisos resueltos, atados a la identidad de la sesión que los pidió:
  // si la sesión cambió y aún no llegó su token, todavía "se está resolviendo"
  // — sin banderas sincronizadas a mano dentro del efecto.
  const [resolved, setResolved] = useState<{
    forSession: HostProvidedSession;
    permissions: CapacityPermission[];
  } | null>(null);

  useEffect(() => {
    if (hostSession.status !== "authenticated") return;
    let cancelled = false;
    acquireToken(CAPACITY_API_SCOPES)
      .then((token) => {
        if (cancelled) return;
        setResolved({
          forSession: hostSession,
          permissions: token
            ? mapCapacityRoles(decodeJwtPayload(token).roles)
            : [],
        });
      })
      .catch(() => {
        if (!cancelled)
          setResolved({ forSession: hostSession, permissions: [] });
      });
    return () => {
      cancelled = true;
    };
    // La identidad de la sesión decide cuándo re-pedir: un token del host
    // renovado para la misma persona llega como sesión nueva desde el store.
  }, [hostSession, acquireToken]);

  const resolving =
    hostSession.status === "authenticated" &&
    resolved?.forSession !== hostSession;

  const session = useMemo<Session>(
    () =>
      hostSession.status === "authenticated"
        ? {
            ...hostSession,
            permissions:
              resolved?.forSession === hostSession ? resolved.permissions : [],
          }
        : hostSession,
    [hostSession, resolved]
  );

  const value = useMemo(
    () => deriveAuthSession(session, resolving),
    [session, resolving]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
