import {
  LevelMeter,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";

export const meta = {
  title: "Matriz con columna fija",
  description:
    "Muchas columnas de contenido corto: la densidad `matrix` las junta lo suficiente para comparar filas, y `stickyFirstColumn` deja anclada la columna que dice de quién es cada fila.",
  caption: 'density="matrix" + stickyFirstColumn — desplaza horizontalmente para ver la separación aparecer',
};

const habilidades = [
  "Desarrollo de software",
  "Ciclo de desarrollo",
  "Conocimiento del negocio",
  "Arquitectura",
  "Calidad",
  "Datos",
  "Pensamiento crítico",
  "Comunicación",
];

const personas = [
  { nombre: "Julián Pérez", niveles: [3, 3, 2, 2, 3, 1, 3, 2] },
  { nombre: "Laura Ruiz", niveles: [4, 3, 3, 3, 2, 2, 3, 3] },
  { nombre: "Paula Restrepo", niveles: [2, 2, 1, 2, 2, 1, 2, 3] },
];

export default function Example() {
  return (
    <Table density="matrix" stickyFirstColumn>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-40">Capacidad</TableHead>
          {habilidades.map((habilidad) => (
            <TableHead key={habilidad} className="min-w-28">
              {habilidad}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {personas.map((persona) => (
          <TableRow key={persona.nombre}>
            <TableCell className="whitespace-nowrap">{persona.nombre}</TableCell>
            {persona.niveles.map((nivel, i) => (
              <TableCell key={habilidades[i]}>
                <LevelMeter
                  value={nivel}
                  tone="blue"
                  label={`${habilidades[i]} de ${persona.nombre}`}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
