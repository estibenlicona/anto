import React, { useEffect, useMemo, useState } from "react";
import { AuthContext } from "@app/providers/AuthContext";
import { deriveAuthSession } from "@features/auth-session";
import { setAccessTokenProvider } from "@shared/services/accessToken";
import {
  DEFAULT_PROFILE_ID,
  SIMULATOR_PROFILES,
  profileToSession,
} from "./profiles";
import { SimulatorControlContext } from "./SimulatorControlContext";

/**
 * **Sólo desarrollo.** Ver `profiles.ts`.
 *
 * Provee el mismo puerto que `HostAuthProvider`, para que nada del negocio
 * pueda notar la diferencia. Lo único que agrega es un contexto aparte con
 * los controles, que consume únicamente el panel del simulador.
 */

const STORAGE_KEY = "dev:auth-simulator";

interface StoredState {
  profileId: string;
  tokenExpired: boolean;
}

function readStored(): StoredState {
  const fallback = { profileId: DEFAULT_PROFILE_ID, tokenExpired: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    // Se valida el perfil guardado: si se renombró o se quitó, se vuelve al
    // por defecto en vez de quedar sin sesión sin explicación.
    const exists = SIMULATOR_PROFILES.some((p) => p.id === parsed.profileId);
    return {
      profileId: exists ? parsed.profileId! : DEFAULT_PROFILE_ID,
      tokenExpired: Boolean(parsed.tokenExpired),
    };
  } catch {
    return fallback;
  }
}

export const SimulatedAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<StoredState>(readStored);

  // Sobrevive a la recarga para no tener que reelegir el perfil en cada
  // refresco durante el desarrollo.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Modo privado o almacenamiento bloqueado: el simulador sigue
      // funcionando, sólo que sin recordar la elección.
    }
  }, [state]);

  const profile = useMemo(
    () =>
      SIMULATOR_PROFILES.find((p) => p.id === state.profileId) ??
      SIMULATOR_PROFILES.find((p) => p.id === DEFAULT_PROFILE_ID)!,
    [state.profileId]
  );

  const session = useMemo(
    () => profileToSession(profile, state.tokenExpired),
    [profile, state.tokenExpired]
  );

  // El mismo registro que usa el adaptador del host: `httpClient` pregunta por
  // el token sin saber quién se lo provee.
  useEffect(
    () =>
      setAccessTokenProvider(() =>
        session.status === "authenticated" ? session.accessToken : null
      ),
    [session]
  );

  // Con el simulador activo se enciende la puerta de enlace mockeada, para que
  // una llamada sin token reciba 401 como la recibiría en producción.
  //
  // El import es dinámico para no arrastrar los handlers cuando se corre sin
  // mocks: el simulador sirve igual para probar guards y menús contra un
  // backend real, y en ese caso no hay puerta de enlace que configurar.
  useEffect(() => {
    if (import.meta.env.VITE_USE_MOCKS !== "true") return;
    let cancelled = false;
    import("../../mocks/handlers/gateway.handlers").then(
      ({ setGatewayBehavior }) => {
        if (!cancelled) setGatewayBehavior({ requireToken: true });
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => deriveAuthSession(session, false), [session]);

  const controls = useMemo(
    () => ({
      profiles: SIMULATOR_PROFILES,
      activeProfileId: profile.id,
      tokenExpired: state.tokenExpired,
      selectProfile: (profileId: string) =>
        setState((prev) => ({ ...prev, profileId })),
      setTokenExpired: (tokenExpired: boolean) =>
        setState((prev) => ({ ...prev, tokenExpired })),
      signOut: () => setState({ profileId: "anonymous", tokenExpired: false }),
    }),
    [profile.id, state.tokenExpired]
  );

  return (
    <SimulatorControlContext.Provider value={controls}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </SimulatorControlContext.Provider>
  );
};
