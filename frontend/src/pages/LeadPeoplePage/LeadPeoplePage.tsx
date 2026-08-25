import React from "react";
import { PeopleContainer } from "@features/people/PeopleContainer";

export const LeadPeoplePage: React.FC = () => {
  return (
    <div>
      <h1 className="sr-only">Gestionar Personas</h1>
      <PeopleContainer />
    </div>
  );
};
