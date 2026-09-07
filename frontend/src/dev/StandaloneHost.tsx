import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CapacityModule from "../module/CapacityModule";
import type { HostProvidedSource } from "../module/contract";
import { CAPACITY_PERMISSIONS } from "@features/auth-session";

/**
 * Un host falso, sólo para desarrollo (`pnpm dev:mock`): monta el módulo con
 * el mismo contrato que le entrega el host real —fuente de sesión,
 * `acquireToken`, ruta base y alto de barra— pero con una sesión fija y un
 * token fabricado con todos los permisos de sección. Así la app se abre
 * standalone con datos de MSW, sin levantar el trío emulador + host + remote.
 *
 * No es una vía alternativa de sesión dentro del módulo: el módulo no cambia
 * ni elige nada en runtime — recibe props, como siempre. Quien cambia es
 * quién lo monta, y este montador no entra al build del remote (main.tsx lo
 * importa dinámicamente detrás de una condición de build).
 */

const b64url = (value: string): string =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/**
 * Un JWT de utilería: header y firma de relleno, payload real con los
 * sub-claims `Capacidad.*` completos. `CapacityPermissionsProvider` sólo lee
 * el payload (la validación es del backend), así que esto alcanza para que
 * el menú ofrezca todas las secciones.
 */
const FAKE_TOKEN = [
  b64url(JSON.stringify({ alg: "none", typ: "JWT" })),
  b64url(
    JSON.stringify({
      roles: CAPACITY_PERMISSIONS.map((p) => `Capacidad.${p}`),
      aud: "api://capacidad",
      name: "Dev Standalone",
    })
  ),
  "firma-de-utileria",
].join(".");

/** Misma referencia siempre: el contrato exige estabilidad entre lecturas. */
const SESSION = {
  status: "authenticated" as const,
  user: {
    id: "dev-standalone",
    name: "Dev Standalone",
    username: "dev@standalone.local",
  },
  roles: ["admin" as const, "chapter-lead" as const],
  scopes: ["api://capacidad/access_as_user"],
  claims: {},
  accessToken: FAKE_TOKEN,
};

const source: HostProvidedSource = {
  getSession: () => SESSION,
  // La sesión fija nunca cambia: suscribirse es un no-op con su baja.
  subscribe: () => () => {},
};

const acquireToken = async (): Promise<string | null> => FAKE_TOKEN;

const BASE_PATH = "/capacidad";

export const StandaloneHost: React.FC = () => (
  <BrowserRouter>
    <div className="border-b border-neutral-default bg-neutral-subtle px-6 py-2 text-body-sm text-neutral-subtle">
      Modo standalone con mocks (<code>pnpm dev:mock</code>): sesión fija con
      todos los permisos. El módulo real se monta desde el host.
    </div>
    <Routes>
      <Route
        path={`${BASE_PATH}/*`}
        element={
          <CapacityModule
            source={source}
            acquireToken={acquireToken}
            basePath={BASE_PATH}
            // El alto de la franja de aviso de arriba, para que el sidebar
            // del módulo empiece debajo de ella como lo haría bajo la barra.
            topOffset={36}
          />
        }
      />
      <Route path="*" element={<Navigate to={BASE_PATH} replace />} />
    </Routes>
  </BrowserRouter>
);
