import React from "react";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AppRouter } from "./router";

/**
 * App Component
 *
 * Composition root. Recibe quién provee la sesión en vez de elegirlo: la
 * elección se hace en `main.tsx`, que es donde vive la única condición sobre
 * el modo de autenticación en toda la aplicación.
 *
 * Esta aplicación no inicia sesión — como microfrontend, la produce el host.
 * `DevPanel` sólo llega con valor en desarrollo con el simulador activo; en
 * producción esa rama es código muerto y no entra al bundle.
 */
export type AuthProviderComponent = React.ComponentType<{
  children: React.ReactNode;
}>;

export interface AppProps {
  AuthProvider: AuthProviderComponent;
  DevPanel?: React.ComponentType;
}

const App: React.FC<AppProps> = ({ AuthProvider, DevPanel }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
        {DevPanel && <DevPanel />}
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
