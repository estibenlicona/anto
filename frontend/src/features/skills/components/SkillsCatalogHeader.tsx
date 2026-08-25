import React from "react";
import { Button, Icon } from "@tuya-ui/components";

interface SkillsCatalogHeaderProps {
  onNew: () => void;
}

export const SkillsCatalogHeader: React.FC<SkillsCatalogHeaderProps> = ({
  onNew,
}) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h1 className="text-heading-lg font-semibold text-neutral-default">
        Habilidades y niveles
      </h1>
      <p className="text-body-sm text-neutral-subtle">
        El catálogo con el que se evalúa: qué se mide, qué significa cada nivel
        y qué pide cada cargo.
      </p>
    </div>
    {/* La única acción de marca de la pantalla; el resto va subtle. */}
    <Button
      variant="primary"
      className="shrink-0"
      onClick={onNew}
      iconBefore={<Icon name="plus" size={16} />}
    >
      Nueva habilidad
    </Button>
  </div>
);
