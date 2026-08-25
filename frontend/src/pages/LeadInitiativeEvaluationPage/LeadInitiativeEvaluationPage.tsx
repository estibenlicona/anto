import React from "react";
import { useParams } from "react-router-dom";
import { InitiativeEvaluationContainer } from "@features/initiatives/InitiativeEvaluationContainer";

export const LeadInitiativeEvaluationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <InitiativeEvaluationContainer initiativeId={id ?? ""} />;
};
