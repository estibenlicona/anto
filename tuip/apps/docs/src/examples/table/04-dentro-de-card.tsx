import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";

export const meta = {
  title: "Dentro de una Card",
  description:
    "Card ya dibuja borde y esquinas; con `flush` la tabla no dibuja los suyos y se integra a ras, en vez de mostrar un borde dentro de otro.",
  caption: "flush + Card — un solo borde, el de la Card",
};

const bandas = [
  { talla: "XS", lectura: "Cambio menor", puntaje: "0 – 20", pm: "0,5 – 1,0" },
  { talla: "S", lectura: "Ajuste puntual", puntaje: "21 – 40", pm: "1,0 – 3,0" },
  { talla: "M", lectura: "Iniciativa media", puntaje: "41 – 60", pm: "3,0 – 6,0" },
  { talla: "L", lectura: "Iniciativa grande", puntaje: "61 – 80", pm: "6,0 – 10,0" },
];

export default function Example() {
  return (
    <Card className="w-full">
      <CardHeader>Bandas de talla</CardHeader>
      <Table flush>
        <TableHeader>
          <TableRow>
            <TableHead>Talla</TableHead>
            <TableHead>Lectura</TableHead>
            <TableHead align="right">Puntaje %</TableHead>
            <TableHead align="right">Persona-mes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bandas.map((banda) => (
            <TableRow key={banda.talla}>
              <TableCell>{banda.talla}</TableCell>
              <TableCell>{banda.lectura}</TableCell>
              <TableCell align="right">{banda.puntaje}</TableCell>
              <TableCell align="right">{banda.pm}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
