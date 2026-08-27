import React from "react";
import { AbsencesContainer } from "@features/absences/AbsencesContainer";

// El nombre de la pantalla lo muestra el breadcrumb del shell; el h1 queda
// sr-only para conservar el landmark de encabezado sin repetir el título en
// la interfaz visible (mismo patrón que LeadPeoplePage).
export const LeadAbsencesPage: React.FC = () => (
  <div>
    <h1 className="sr-only">Gestionar Ausencias</h1>
    <AbsencesContainer />
  </div>
);
