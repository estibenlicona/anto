import { SeniorityCard } from "@tuya-ui/components";

export const meta = {
  title: "La escala completa",
  description:
    "Los cuatro niveles, uno al lado del otro. Todos miden lo mismo: es lo que permite comparar el nivel de una fila con el de otra sin leer las etiquetas.",
  caption: "Principiante · Competente · Avanzado · Experto",
};

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SeniorityCard level="Principiante" />
      <SeniorityCard level="Competente" />
      <SeniorityCard level="Avanzado" />
      <SeniorityCard level="Experto" />
    </div>
  );
}
