import React from "react";
import { useParams } from "react-router-dom";
import { BillingDetailContainer } from "@features/billing/BillingDetailContainer";

export const LeadBillingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <BillingDetailContainer billingId={id ?? ""} />;
};
