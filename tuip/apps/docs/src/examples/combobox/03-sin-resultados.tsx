import { Combobox } from "@tuya-ui/components";

export const meta = {
  title: "Sin resultados",
  description:
    "Cuando el texto escrito no coincide con ninguna opción, el Combobox lo informa en vez de mostrar una lista vacía sin explicación.",
  caption: "escribí algo que no coincida con ninguna opción para verlo",
};

const OPTIONS = [
  { value: "java", label: "Java" },
  { value: "kafka", label: "Kafka" },
];

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <Combobox label="Tecnología" placeholder="Buscar…" options={OPTIONS} />
    </div>
  );
}
