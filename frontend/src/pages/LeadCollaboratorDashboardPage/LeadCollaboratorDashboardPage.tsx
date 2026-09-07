import React from "react";
import { useParams } from "react-router-dom";
import { CollaboratorDashboardContainer } from "@features/dedication/CollaboratorDashboardContainer";

export const LeadCollaboratorDashboardPage: React.FC = () => {
  const { personId } = useParams<{ personId: string }>();
  return <CollaboratorDashboardContainer personId={personId} />;
};
