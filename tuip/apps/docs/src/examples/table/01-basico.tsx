import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tuya-ui/components";

export const meta = {
  title: "Básico",
  description: "Cabecera y filas, compuestas a mano con las partes de Table.",
  caption: "TableHeader con TableHead · TableBody con TableRow y TableCell",
};

export default function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Célula</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Julián Pérez</TableCell>
          <TableCell>Backend Platform</TableCell>
          <TableCell>Activo</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>María González</TableCell>
          <TableCell>Backend Platform</TableCell>
          <TableCell>Sobreasignada</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Laura Ruiz</TableCell>
          <TableCell>Canales Digitales</TableCell>
          <TableCell>Sin vincular</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
