import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from "@tuya-ui/components";

export const meta = {
  title: "En una celda de tabla",
  description:
    "El uso que motivó el componente: una columna cuyos valores vienen de un conjunto cerrado y se agrupan mejor con color.",
  caption: "Tag dentro de TableCell · Table flush dentro de Card",
};

const bandas = [
  { talla: "XS", color: "gray", lectura: "Cambio menor", pm: "0,5 – 1,0" },
  { talla: "S", color: "green", lectura: "Ajuste puntual", pm: "1,0 – 3,0" },
  { talla: "M", color: "blue", lectura: "Iniciativa media", pm: "3,0 – 6,0" },
  { talla: "L", color: "amber", lectura: "Iniciativa grande", pm: "6,0 – 10,0" },
  { talla: "XL", color: "red", lectura: "Transformación mayor", pm: "10,0 – 18,0" },
] as const;

export default function Example() {
  return (
    <Card className="w-full">
      <CardHeader>Bandas de talla</CardHeader>
      <Table flush>
        <TableHeader>
          <TableRow>
            <TableHead>Talla</TableHead>
            <TableHead>Lectura</TableHead>
            <TableHead align="right">Persona-mes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bandas.map((banda) => (
            <TableRow key={banda.talla}>
              <TableCell>
                <Tag color={banda.color}>{banda.talla}</Tag>
              </TableCell>
              <TableCell>{banda.lectura}</TableCell>
              <TableCell align="right">{banda.pm}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
