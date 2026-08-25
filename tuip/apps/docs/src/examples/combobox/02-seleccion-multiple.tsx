import { Combobox } from "@tuya-ui/components";

export const meta = {
  title: "Selección múltiple",
  description: "Las opciones elegidas quedan visibles como chips removibles dentro del propio campo.",
  caption: "multiple: true — chips removibles con clic o con Backspace sobre el campo vacío",
};

const OPTIONS = [
  { value: "java", label: "Java" },
  { value: "as-400", label: "AS-400" },
  { value: "kafka", label: "Kafka" },
  { value: "postgres", label: "PostgreSQL" },
  { value: "react", label: "React" },
  { value: "node", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "terraform", label: "Terraform" },
];

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <Combobox
        label="Tecnologías"
        placeholder="Buscar…"
        options={OPTIONS}
        multiple
        defaultValue={["java", "kafka"]}
      />
    </div>
  );
}
