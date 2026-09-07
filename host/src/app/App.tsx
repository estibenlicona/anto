import React from "react";
import { AppRouter } from "./router";

/**
 * Composition root. Recibe quién provee la sesión en vez de elegirlo: la
 * elección se hace en `main.tsx`, donde vive la única condición sobre el
 * modo de autenticación de todo el host. Los tests montan la app con un
 * puerto de sesión falso sin tocar MSAL.
 */
export type AuthProviderComponent = React.ComponentType<{
  children: React.ReactNode;
}>;

export interface AppProps {
  AuthProvider: AuthProviderComponent;
}

const App: React.FC<AppProps> = ({ AuthProvider }) => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;
