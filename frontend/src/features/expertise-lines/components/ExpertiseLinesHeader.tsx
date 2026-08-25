import React from "react";
import { Button, Icon } from "@tuya-ui/components";

interface ExpertiseLinesHeaderProps {
  onNew: () => void;
}

/**
 * La pantalla se presenta como los demás módulos.
 *
 * Antes no tenía encabezado, y no por descuido: su requisito lo prohibía,
 * razonando que la navegación lateral y el breadcrumb ya identifican la
 * pantalla. Es cierto sobre la identificación y no sobre lo demás — un
 * encabezado además dice qué se hace acá y ofrece la acción principal—, y el
 * producto entero fue en la otra dirección: era la única de seis sin él, y
 * abría con un botón flotando sobre un vacío.
 */
export const ExpertiseLinesHeader: React.FC<ExpertiseLinesHeaderProps> = ({
  onNew,
}) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h1 className="text-heading-lg font-semibold text-neutral-default">
        Líneas de expertise
      </h1>
      <p className="text-body-sm text-neutral-subtle">
        Las disciplinas en las que se agrupa el chapter: quién las lidera y qué
        capacidad reúne cada una.
      </p>
    </div>
    {/* La única acción de marca de la pantalla; el resto va subtle. */}
    <Button
      variant="primary"
      className="shrink-0"
      onClick={onNew}
      iconBefore={<Icon name="plus" size={16} />}
    >
      Nueva línea
    </Button>
  </div>
);
