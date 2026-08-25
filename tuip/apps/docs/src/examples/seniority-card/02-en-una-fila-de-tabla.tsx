import {
  SeniorityCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";

export const meta = {
  title: "En una fila de tabla",
  description:
    "Dentro de un listado va en densidad compacta, que es la que corresponde a una fila. La persona sin nivel asignado ocupa lo mismo que las demás, así que la columna no se desalinea.",
  caption: "density=\"compact\", con una fila sin dato",
};

const people = [
  { name: "María González", role: "Backend Dev", seniority: "Experto" },
  { name: "Julián Pérez", role: "Frontend Dev", seniority: "Avanzado" },
  { name: "Laura Ruiz", role: "QA Engineer", seniority: "Competente" },
  { name: "Carlos Mora", role: "Data Analyst", seniority: null },
];

export default function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Seniority</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((person) => (
          <TableRow key={person.name}>
            <TableCell>{person.name}</TableCell>
            <TableCell>{person.role}</TableCell>
            <TableCell>
              <SeniorityCard level={person.seniority} density="compact" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
