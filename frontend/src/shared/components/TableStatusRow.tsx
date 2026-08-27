import React from "react";
import { TableCell, TableRow } from "@tuya-ui/components";

export interface TableStatusRowProps {
  /**
   * Cuántas columnas tiene la tabla. Explícito a propósito: contarlas desde
   * acá obligaría a inspeccionar las cabeceras hermanas, y una columna que se
   * agrega sin actualizar este número se nota en la primera carga.
   */
  colSpan: number;
  children: React.ReactNode;
}

/**
 * Una fila de ancho completo para lo que no es una fila: "Cargando…", el
 * error de carga o el "Sin resultados". Va dentro del cuerpo de la tabla para
 * que la barra de búsqueda y filtros (el slot `toolbar`) y las cabeceras se
 * queden donde están mientras los datos cambian de estado.
 */
export const TableStatusRow: React.FC<TableStatusRowProps> = ({
  colSpan,
  children,
}) => (
  <TableRow className="hover:bg-transparent">
    <TableCell colSpan={colSpan} className="py-8 text-center">
      <div className="flex justify-center">{children}</div>
    </TableCell>
  </TableRow>
);
