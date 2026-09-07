import React from "react";

/**
 * Se muestra antes de montar la aplicación cuando falta la configuración de
 * Entra: un error que nombra la variable, en
 * vez de una pantalla en blanco. Sin tuip a propósito — corre aun si nada
 * más pudo inicializarse.
 */
export const ConfigErrorPage: React.FC<{
  variable: string;
  message: string;
}> = ({ variable, message }) => (
  <main
    role="alert"
    style={{
      fontFamily: "var(--font-sans, sans-serif)",
      maxWidth: 640,
      margin: "10vh auto",
      padding: 24,
    }}
  >
    <h1 style={{ fontSize: 20, marginBottom: 12 }}>
      Falta configurar la autenticación
    </h1>
    <p style={{ marginBottom: 8 }}>
      Variable ausente: <code>{variable}</code>
    </p>
    <p style={{ opacity: 0.8 }}>{message}</p>
  </main>
);
