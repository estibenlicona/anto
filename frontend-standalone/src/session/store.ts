import type { HostProvidedSession, HostProvidedSource } from "@front/module/contract";
import { findProfile, type SimulatedProfile } from "./profiles";

/**
 * La sesión simulada, con la misma forma con la que el host se la entrega al
 * módulo: `getSession` con referencia estable mientras no cambie y
 * `subscribe` a los cambios. El módulo no sabe que es simulada — recibe el
 * mismo contrato que en producción.
 *
 * Persiste el perfil elegido en sessionStorage: recargar no cierra sesión,
 * cerrar la pestaña sí.
 */
const STORAGE_KEY = "gestion-capacidad.standalone.profile";

const b64url = (value: string): string =>
  btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/**
 * Un JWT de utilería para la API del módulo: header y firma de relleno, y un
 * payload real con `oid` (los mocks resuelven con él a quién tiene a cargo el
 * titular) y los sub-claims `Capacidad.*` del perfil (los permisos de
 * sección). Nadie valida la firma en desarrollo.
 */
function tokenOf(profile: SimulatedProfile): string {
  return [
    b64url(JSON.stringify({ alg: "none", typ: "JWT" })),
    b64url(
      JSON.stringify({
        oid: profile.oid,
        name: profile.name,
        preferred_username: profile.upn,
        aud: "api://capacidad",
        roles: profile.sections.map((s) => `Capacidad.${s}`),
      })
    ),
    "firma-de-utileria",
  ].join(".");
}

function sessionOf(profile: SimulatedProfile | null): HostProvidedSession {
  if (!profile) return { status: "anonymous" };
  return {
    status: "authenticated",
    user: { id: profile.oid, name: profile.name, username: profile.upn },
    roles: profile.roles,
    scopes: ["api://capacidad/access_as_user"],
    claims: { oid: profile.oid, upn: profile.upn, name: profile.name },
    accessToken: tokenOf(profile),
  };
}

function readStored(): SimulatedProfile | null {
  try {
    return findProfile(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

let profile: SimulatedProfile | null = readStored();
let session: HostProvidedSession = sessionOf(profile);
const listeners = new Set<() => void>();

function set(next: SimulatedProfile | null) {
  profile = next;
  session = sessionOf(next);
  try {
    if (next) sessionStorage.setItem(STORAGE_KEY, next.id);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sin storage (navegación privada estricta) la sesión vive en memoria.
  }
  listeners.forEach((l) => l());
}

export const sessionSource: HostProvidedSource = {
  getSession: () => session,
  subscribe: (onChange) => {
    listeners.add(onChange);
    return () => listeners.delete(onChange);
  },
};

export const currentProfile = () => profile;

export function login(profileId: string) {
  set(findProfile(profileId));
}

export function logout() {
  set(null);
}

/** Lo que el módulo pide con `acquireToken(scopes)`: el token del perfil. */
export const acquireToken = async (): Promise<string | null> =>
  profile ? tokenOf(profile) : null;
