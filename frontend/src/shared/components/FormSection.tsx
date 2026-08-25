import React from "react";
import { Icon } from "@tuya-ui/components";
import type { IconName } from "@tuya-ui/components";

/**
 * Zona de un formulario en Drawer: ícono en pastilla y título en caja normal,
 * no un eyebrow diminuto en mayúscula — el rótulo tiene que competir con los
 * rótulos de campo que lo siguen, y `text-label` perdía esa pelea.
 *
 * Las zonas se separan con filetes de ancho completo en vez de paneles
 * rellenos. El padding horizontal vive acá y no en `DrawerBody` (que va en
 * `p-0`) justamente para que el filete llegue de borde a borde en vez de
 * quedar recuadrado por el padding del contenedor.
 *
 * La comparten los formularios de Personas, Células y Asignaciones.
 */
export function FormSection({
  icon,
  title,
  first,
  children,
}: {
  icon: IconName;
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`flex flex-col gap-4 px-6 py-5${
        first ? "" : " border-t-default border-neutral-default"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-brand-subtle text-brand-default">
          <Icon name={icon} size={16} />
        </span>
        <h3 className="text-body font-semibold text-neutral-default">
          {title}
        </h3>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
