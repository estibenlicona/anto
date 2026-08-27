import React from "react";
import { BillingContainer } from "@features/billing/BillingContainer";

export const LeadBillingPage: React.FC = () => {
  return (
    <div>
      <h1 className="sr-only">Prefacturación</h1>
      <BillingContainer />
    </div>
  );
};
