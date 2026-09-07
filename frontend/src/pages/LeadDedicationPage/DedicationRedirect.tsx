import React from "react";
import { Navigate } from "react-router-dom";

/**
 * La antigua pantalla de Backlog (cola de triage) ya no existe: la pregunta
 * que responde este módulo es cuánta dedicación real tiene cada capacidad
 * frente a la asignada. La ruta queda sólo para no romper enlaces guardados.
 */
export const DedicationRedirect: React.FC = () => (
  <Navigate replace to="/app/lead/dedicacion" />
);
