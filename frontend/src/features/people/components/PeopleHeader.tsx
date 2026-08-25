import React from "react";
import { Button, Icon } from "@tuya-ui/components";

export interface PeopleHeaderProps {
  onCreate: () => void;
}

export const PeopleHeader: React.FC<PeopleHeaderProps> = ({ onCreate }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h1 className="text-heading-lg font-semibold text-neutral-default">
        Personas
      </h1>
      <p className="text-body-sm text-neutral-subtle">
        Perfiles y seniority del equipo
      </p>
    </div>
    <Button
      variant="primary"
      onClick={onCreate}
      iconBefore={<Icon name="user" size={20} />}
    >
      Nueva persona
    </Button>
  </div>
);
