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
 * `badge` y `description` son opcionales: una etiqueta junto al título
 * ("Opcional") y una línea que explique la zona antes de sus campos. Sin
 * ellos el markup es el de siempre.
 *
 * La comparten los formularios de Personas, Células y Asignaciones.
 */
export function FormSection({
  icon,
  title,
  badge,
  description,
  first,
  children,
}: {
  icon: IconName;
  title: string;
  badge?: React.ReactNode;
  description?: React.ReactNode;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`flex flex-col gap-4 px-6 py-5${
        first ? "" : " border-t-default border-neutral-default"
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-brand-subtle text-brand-default">
            <Icon name={icon} size={16} />
          </span>
          {/*
            `m-0` no es redundante: el h3 trae del navegador un margen inferior
            propio que, dentro de un `items-center`, cuenta como parte de la
            caja y sube el título medio margen respecto del icono. Sin esta
            clase la fila mide 38px en vez de 32 y el texto queda 6px por
            encima del eje de la pastilla.
          */}
          <h3 className="m-0 text-body font-semibold text-neutral-default">
            {title}
          </h3>
          {/* Al extremo derecho de la fila, no pegado al título. */}
          {badge && <span className="ml-auto">{badge}</span>}
        </div>
        {description && (
          <p className="text-body-sm text-neutral-subtle">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
