import React from "react";
import { useParams } from "react-router-dom";
import { PersonDetailContainer } from "@features/people/PersonDetailContainer";

export const LeadPersonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <PersonDetailContainer personId={id} />;
};
