import React from "react";
import { SquadsContainer } from "@features/squads/SquadsContainer";

// El h1 visible lo pone el encabezado del módulo (SquadsHeader); sumar uno
// oculto acá dejaría dos h1 en la página.
export const LeadSquadsPage: React.FC = () => {
  return <SquadsContainer />;
};
