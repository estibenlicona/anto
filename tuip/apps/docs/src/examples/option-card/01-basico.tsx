import { useState } from "react";
import { OptionCard, OptionCardGroup, Select } from "@tuya-ui/components";

export const meta = {
  title: "Clasificar una historia",
  description:
    "Tres opciones con descripción; la primera trae su propio Select, que sólo importa al elegirla. Flechas para moverse, Espacio o Enter para elegir, Tab para entrar al Select. Los atajos 1/2/3 los escucha este ejemplo, no el componente.",
  caption: "OptionCardGroup en 3 columnas con contenido propio y atajos",
};

const INITIATIVES = [
  { value: "kafka", label: "Kafka Migration" },
  { value: "pagos", label: "Payment Engine v2" },
];
const BAU = [
  { value: "soporte", label: "Soporte y operación" },
  { value: "correctivo", label: "Mantenimiento correctivo" },
  { value: "docs", label: "Documentación técnica" },
];

export default function Example() {
  const [kind, setKind] = useState("initiative");
  const [initiative, setInitiative] = useState("kafka");
  const [category, setCategory] = useState<string | undefined>(undefined);

  return (
    <div
      className="w-full max-w-3xl"
      onKeyDown={(e) => {
        if (e.key === "1") setKind("initiative");
        if (e.key === "2") setKind("bau");
        if (e.key === "3") setKind("discard");
      }}
    >
      <OptionCardGroup label="¿Qué es este trabajo?" value={kind} onValueChange={setKind} columns={3}>
        <OptionCard value="initiative" title="Iniciativa" description="Trabajo de una iniciativa activa de la célula." shortcut="1">
          <Select label="Iniciativa" options={INITIATIVES} value={initiative} onValueChange={setInitiative} />
        </OptionCard>
        <OptionCard value="bau" title="BAU" description="Operación, soporte o mantenimiento del día a día." shortcut="2">
          <Select label="Categoría" options={BAU} value={category} onValueChange={setCategory} placeholder="Categoría…" />
        </OptionCard>
        <OptionCard value="discard" title="Descartar" description="No cuenta como FTE: duplicada, técnica, de otro equipo." shortcut="3" />
      </OptionCardGroup>
    </div>
  );
}
