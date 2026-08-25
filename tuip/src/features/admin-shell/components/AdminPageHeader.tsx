import React from "react";

export interface AdminPageHeaderProps {
  title: string;
}

/**
 * Visualmente oculto: el sidebar (entrada activa) y el breadcrumb del
 * AdminLayout ya muestran el título y la categoría de la pantalla. Este
 * `<h1>` sr-only conserva el landmark de encabezado para lectores de
 * pantalla sin duplicar el texto en la interfaz visible.
 */
export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title }) => {
  return <h1 className="sr-only">{title}</h1>;
};
