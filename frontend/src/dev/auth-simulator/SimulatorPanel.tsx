import React, { useState } from "react";
import { useSimulatorControls } from "./SimulatorControlContext";

/**
 * **Sólo desarrollo.** Ver `profiles.ts`.
 *
 * Panel flotante para elegir perfil y aplicar la sesión simulada. El
 * tratamiento visual es deliberadamente ajeno al design system —colores
 * crudos, esquina fija, franja de advertencia— para que nadie lo confunda con
 * funcionalidad del producto ni lo tome como referencia de estilo.
 */
export const SimulatorPanel: React.FC = () => {
  const {
    profiles,
    activeProfileId,
    tokenExpired,
    selectProfile,
    setTokenExpired,
    signOut,
  } = useSimulatorControls();
  const [open, setOpen] = useState(false);

  const active = profiles.find((p) => p.id === activeProfileId);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 2147483647,
        fontFamily: "monospace",
        fontSize: 12,
      }}
    >
      {open && (
        <div
          style={{
            width: 300,
            marginBottom: 8,
            padding: 12,
            background: "#1f1f23",
            color: "#f5f5f5",
            border: "2px solid #ff6b00",
            borderRadius: 8,
          }}
        >
          <div
            style={{ color: "#ff6b00", fontWeight: "bold", marginBottom: 8 }}
          >
            SIMULADOR DE AUTENTICACIÓN — sólo desarrollo
          </div>

          {profiles.map((profile) => (
            <label
              key={profile.id}
              style={{
                display: "block",
                marginBottom: 6,
                cursor: "pointer",
                opacity: profile.id === activeProfileId ? 1 : 0.7,
              }}
            >
              <input
                type="radio"
                name="dev-auth-profile"
                checked={profile.id === activeProfileId}
                onChange={() => selectProfile(profile.id)}
                style={{ marginRight: 6 }}
              />
              <strong>{profile.label}</strong>
              <div style={{ marginLeft: 20, opacity: 0.75 }}>
                {profile.description}
              </div>
            </label>
          ))}

          <label
            style={{
              display: "block",
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid #444",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={tokenExpired}
              onChange={(e) => setTokenExpired(e.target.checked)}
              style={{ marginRight: 6 }}
            />
            Token expirado (produce 401)
          </label>

          <button
            type="button"
            onClick={signOut}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "6px 8px",
              background: "#3a3a40",
              color: "#f5f5f5",
              border: "1px solid #666",
              borderRadius: 4,
              cursor: "pointer",
              font: "inherit",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          padding: "8px 12px",
          background: "#ff6b00",
          color: "#1f1f23",
          border: "none",
          borderRadius: 999,
          fontWeight: "bold",
          cursor: "pointer",
          font: "inherit",
          boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        }}
      >
        AUTH: {active?.label ?? "—"}
        {tokenExpired ? " (token vencido)" : ""}
      </button>
    </div>
  );
};
