import React from "react";
import ReactDOM from "react-dom/client";
import App from "@app/App";
import { createSessionStore } from "@features/auth-session";
import { EntraAuthProvider } from "@features/entra/EntraAuthProvider";
import { EntraConfigError, readEntraConfig } from "@features/entra/entraConfig";
import { ConfigErrorPage } from "@pages/ConfigErrorPage";

/**
 * Composition root: la sesión viene siempre del proveedor de identidad
 * (Entra en la nube, o el emulador local cuando `VITE_ENTRA_AUTHORITY`
 * apunta a él — misma configuración, mismo flujo). En desarrollo, el
 * directorio de prueba se siembra con `pnpm entra:seed`.
 *
 * Sin `VITE_ENTRA_CLIENT_ID`/`VITE_ENTRA_TENANT_ID`, `readEntraConfig`
 * lanza y acá se muestra el error con el nombre de la variable, en vez de
 * una pantalla en blanco.
 */
const root = ReactDOM.createRoot(document.getElementById("root")!);

try {
  const config = readEntraConfig();
  const store = createSessionStore();
  root.render(
    <React.StrictMode>
      <App
        AuthProvider={({ children }) => (
          <EntraAuthProvider config={config} store={store}>
            {children}
          </EntraAuthProvider>
        )}
      />
    </React.StrictMode>
  );
} catch (error: unknown) {
  if (error instanceof EntraConfigError) {
    root.render(
      <ConfigErrorPage variable={error.variable} message={error.message} />
    );
  } else {
    throw error;
  }
}
