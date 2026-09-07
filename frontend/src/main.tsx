import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/styles.css";

/**
 * Gestión de Capacidad ya no es una aplicación standalone: es un remote de
 * Module Federation que el host de la plataforma carga bajo su ruta. Este
 * arranque existe sólo para el dev server del remote:
 *
 * - `pnpm dev` — página que remite al host (el módulo real se ve desde ahí).
 * - `pnpm dev:mock` — monta el módulo con un host falso de desarrollo
 *   (sesión fija con todos los permisos + datos de MSW), para probar la app
 *   sin levantar el trío emulador + host + remote.
 *
 * La condición es un literal de build: en el remote de producción la rama
 * muere y el host falso no entra al bundle.
 */
const root = ReactDOM.createRoot(document.getElementById("root")!);

if (import.meta.env.VITE_STANDALONE === "true") {
  void import("./dev/StandaloneHost").then(({ StandaloneHost }) =>
    root.render(
      <React.StrictMode>
        <StandaloneHost />
      </React.StrictMode>
    )
  );
} else {
  root.render(
    <React.StrictMode>
      <main
        style={{
          fontFamily: "var(--font-sans, sans-serif)",
          maxWidth: 640,
          margin: "10vh auto",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>
          Gestión de Capacidad — remote federado
        </h1>
        <p style={{ marginBottom: 8 }}>
          Este servidor publica el módulo (<code>/remoteEntry.js</code>) para
          que el host lo cargue. Abrí la plataforma desde el host:
        </p>
        <p>
          <a href="http://localhost:4400/capacidad">
            http://localhost:4400/capacidad
          </a>
        </p>
        <p style={{ marginTop: 12 }}>
          Para probar el módulo solo, con mocks: <code>pnpm dev:mock</code>
        </p>
      </main>
    </React.StrictMode>
  );
}
