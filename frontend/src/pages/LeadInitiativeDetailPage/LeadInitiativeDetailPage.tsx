import React from "react";
import { useParams } from "react-router-dom";
import { InitiativeDetailContainer } from "@features/initiatives/InitiativeDetailContainer";

export const LeadInitiativeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <InitiativeDetailContainer initiativeId={id ?? ""} />;
};
