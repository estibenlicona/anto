import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tuya-ui/components";

export const meta = {
  title: "Columna numérica",
  description: "Los números se alinean a la derecha con cifras tabulares; un dato ausente se muestra como “—”.",
  caption: 'align="right" en la cabecera y en cada celda de la columna',
};

export default function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Capacidad</TableHead>
          <TableHead align="right">FTE</TableHead>
          <TableHead align="right">Horas S16</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Julián Pérez</TableCell>
          <TableCell align="right">1.0</TableCell>
          <TableCell align="right">111.0</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Laura Ruiz</TableCell>
          <TableCell align="right">0.8</TableCell>
          <TableCell align="right" className="text-neutral-subtle">
            —
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
