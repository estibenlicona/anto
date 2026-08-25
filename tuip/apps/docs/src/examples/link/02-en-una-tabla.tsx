import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";

export const meta = {
  title: "En una columna de tabla",
  description:
    "El caso que motiva el tono neutro. Arriba, el nombre en tono de marca: con una fila alcanza para destacar, pero repetido hacia abajo tiñe la columna entera y deja de señalar nada. Abajo, el mismo listado en tono neutro, donde la columna se lee como el resto de la tabla.",
  caption: 'la misma columna con tone="brand" y con tone="neutral"',
};

const people = [
  { name: "Julián Pérez", squad: "Backend Platform", role: "Desarrollador" },
  { name: "María González", squad: "Backend Platform", role: "Tech Lead" },
  { name: "Laura Ruiz", squad: "Canales Digitales", role: "Desarrolladora" },
];

function PeopleTable({ tone }: { tone: "brand" | "neutral" }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Célula</TableHead>
          <TableHead>Rol</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((person) => (
          <TableRow key={person.name}>
            <TableCell>
              <Link href="#" tone={tone}>
                {person.name}
              </Link>
            </TableCell>
            <TableCell>{person.squad}</TableCell>
            <TableCell>{person.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function Example() {
  return (
    <div className="flex flex-col gap-6">
      <PeopleTable tone="brand" />
      <PeopleTable tone="neutral" />
    </div>
  );
}
