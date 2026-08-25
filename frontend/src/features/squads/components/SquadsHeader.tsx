import React from "react";
import { Button, Icon } from "@tuya-ui/components";

export interface SquadsHeaderProps {
  onCreate: () => void;
}

export const SquadsHeader: React.FC<SquadsHeaderProps> = ({ onCreate }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h1 className="text-heading-lg font-semibold text-neutral-default">
        Células
      </h1>
      <p className="text-body-sm text-neutral-subtle">
        Las células del chapter, con su criticidad y la capacidad asignada
      </p>
    </div>
    <Button
      variant="primary"
      onClick={onCreate}
      iconBefore={<Icon name="cell" size={20} />}
    >
      Nueva célula
    </Button>
  </div>
);
