import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";

export const meta = {
  title: "Fila con detalle desplegable",
  description:
    "El detalle se abre como una fila propia debajo, de ancho completo. La apertura es del consumidor: acá dos filas pueden estar abiertas a la vez porque el estado lo permite.",
  caption: "detail + expanded + onExpandedChange — el componente no cierra ninguna fila por su cuenta",
};

const capacidades = [
  {
    nombre: "Julián Pérez",
    brechas: 2,
    cumple: ["Diseña componentes reutilizables", "Documenta decisiones técnicas"],
    falta: ["Lidera el diseño de un dominio completo", "Define estándares del capítulo"],
  },
  {
    nombre: "Laura Ruiz",
    brechas: 1,
    cumple: ["Optimiza consultas sobre datos productivos", "Instrumenta lo que construye"],
    falta: ["Modela el dominio de datos de una célula"],
  },
];

export default function Example() {
  const [abiertas, setAbiertas] = useState<string[]>(["Julián Pérez"]);

  const alternar = (nombre: string, abierta: boolean) =>
    setAbiertas((previas) =>
      abierta ? [...previas, nombre] : previas.filter((n) => n !== nombre),
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Capacidad</TableHead>
          <TableHead align="right">Brechas abiertas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {capacidades.map((capacidad) => (
          <TableRow
            key={capacidad.nombre}
            detailLabel={`Ver criterios de ${capacidad.nombre}`}
            expanded={abiertas.includes(capacidad.nombre)}
            onExpandedChange={(abierta) => alternar(capacidad.nombre, abierta)}
            detail={
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-label uppercase text-neutral-subtle">
                    Cumple ({capacidad.cumple.length})
                  </p>
                  <ul className="mt-2 space-y-1 text-body-sm">
                    {capacidad.cumple.map((criterio) => (
                      <li key={criterio}>{criterio}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-label uppercase text-neutral-subtle">
                    Le falta ({capacidad.falta.length})
                  </p>
                  <ul className="mt-2 space-y-1 text-body-sm text-neutral-subtle">
                    {capacidad.falta.map((criterio) => (
                      <li key={criterio}>{criterio}</li>
                    ))}
                  </ul>
                </div>
              </div>
            }
          >
            <TableCell>{capacidad.nombre}</TableCell>
            <TableCell align="right">{capacidad.brechas}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
