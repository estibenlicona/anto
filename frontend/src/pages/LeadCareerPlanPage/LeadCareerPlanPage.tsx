import React from "react";
import { SpanMatrixContainer } from "@features/career-plan/SpanMatrixContainer";

// El nombre de la pantalla lo muestra el breadcrumb del shell; el h1 queda
// sr-only para conservar el landmark de encabezado sin repetir el título en
// la interfaz visible (mismo patrón que LeadPeoplePage y LeadSquadsPage).
export const LeadCareerPlanPage: React.FC = () => (
  <div>
    <h1 className="sr-only">Competencias</h1>
    <SpanMatrixContainer />
  </div>
);
