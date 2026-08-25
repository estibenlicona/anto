import { useState } from "react";
import { FilterButton } from "@tuya-ui/components";

export const meta = {
  title: "Básico",
  description: "Marcar una o más opciones activa el contador en el trigger.",
  caption: "options + selected controlado por el consumidor",
};

const seniorityOptions = [
  { value: "junior", label: "Junior" },
  { value: "mid-level", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "staff-engineer", label: "Staff Engineer" },
  { value: "principal", label: "Principal" },
];

export default function Example() {
  const [selected, setSelected] = useState<string[]>([]);

  return <FilterButton label="Seniority" options={seniorityOptions} selected={selected} onChange={setSelected} />;
}
