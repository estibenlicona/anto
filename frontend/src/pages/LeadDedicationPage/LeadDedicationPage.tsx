import React from "react";
import { DedicationContainer } from "@features/dedication/DedicationContainer";

// El nombre de la pantalla lo muestra el breadcrumb del shell; el h1 queda
// sr-only para conservar el landmark de encabezado sin repetir el título en
// la interfaz visible (mismo patrón que LeadPeoplePage).
export const LeadDedicationPage: React.FC = () => (
  <div>
    <h1 className="sr-only">Capacidad</h1>
    <DedicationContainer />
  </div>
);
