import React from "react";
import { SquadsContainer } from "@features/squads/SquadsContainer";

// El nombre de la pantalla lo muestra el breadcrumb del shell; el h1 queda
// sr-only para conservar el landmark de encabezado sin repetir el título en
// la interfaz visible (mismo patrón que LeadPeoplePage).
export const LeadSquadsPage: React.FC = () => {
  return (
    <div>
      <h1 className="sr-only">Gestionar Células</h1>
      <SquadsContainer />
    </div>
  );
};
