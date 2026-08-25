import React from "react";
import { useParams } from "react-router-dom";
import { SquadDetailContainer } from "@features/squads/SquadDetailContainer";

export const LeadSquadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <SquadDetailContainer squadId={id} />;
};
