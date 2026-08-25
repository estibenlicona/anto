import React from "react";
import ReactDOM from "react-dom/client";
import App, { type AuthProviderComponent } from "@app/App";
import { HostAuthProvider } from "@features/auth-session";

// import() dinámico: msw/browser y los handlers de mock solo entran al
// bundle cuando VITE_USE_MOCKS está activo — nunca en producción (ver
// openspec/changes/add-browser-mock-mode/design.md, Decisión 3).
async function prepareApp() {
  if (import.meta.env.VITE_USE_MOCKS === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

/**
 * Quién provee la sesión se decide una sola vez, acá. Ningún componente de
 * negocio consulta esta variable ni sabe que existe un simulador.
 *
 * Mismo mecanismo que los mocks: la comparación contra un literal deja la
 * rama muerta en producción, así que el `import()` no se resuelve y
 * `src/dev/` no llega al bundle. Por eso la decisión es de build y no de
 * tiempo de ejecución: si dependiera de `localStorage` o de un parámetro de
 * URL, el simulador sería activable en producción.
 */
async function resolveAuthProvider(): Promise<{
  AuthProvider: AuthProviderComponent;
  DevPanel?: React.ComponentType;
}> {
  if (import.meta.env.VITE_AUTH_SIMULATOR === "true") {
    const { SimulatedAuthProvider } = await import(
      "./dev/auth-simulator/SimulatedAuthProvider"
    );
    const { SimulatorPanel } = await import(
      "./dev/auth-simulator/SimulatorPanel"
    );
    return { AuthProvider: SimulatedAuthProvider, DevPanel: SimulatorPanel };
  }
  return { AuthProvider: HostAuthProvider };
}

Promise.all([prepareApp(), resolveAuthProvider()]).then(
  ([, { AuthProvider, DevPanel }]) => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <App AuthProvider={AuthProvider} DevPanel={DevPanel} />
      </React.StrictMode>
    );
  }
);
