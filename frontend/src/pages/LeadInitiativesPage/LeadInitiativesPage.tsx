import React from "react";
import { InitiativesContainer } from "@features/initiatives/InitiativesContainer";

// El nombre de la pantalla lo muestra el breadcrumb del shell; el h1 queda
// sr-only para conservar el landmark de encabezado sin repetir el título en
// la interfaz visible (mismo patrón que LeadAbsencesPage).
export const LeadInitiativesPage: React.FC = () => (
  <div>
    <h1 className="sr-only">Gestionar Iniciativas</h1>
    <InitiativesContainer />
  </div>
);
