import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/styles.css";

/**
 * Gestión de Capacidad ya no es una aplicación standalone: es un remote de
 * Module Federation que el host de la plataforma carga bajo su ruta. Este
 * arranque existe sólo para que el dev server del remote tenga algo que
 * mostrar si alguien lo abre directo — el módulo real se ve desde el host.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
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
        Este servidor publica el módulo (<code>/remoteEntry.js</code>) para que
        el host lo cargue. Abrí la plataforma desde el host:
      </p>
      <p>
        <a href="http://localhost:4400/capacidad">
          http://localhost:4400/capacidad
        </a>
      </p>
    </main>
  </React.StrictMode>
);
