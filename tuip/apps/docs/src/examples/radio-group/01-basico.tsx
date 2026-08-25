import { RadioGroup } from "@tuya-ui/components";

export const meta = {
  title: "Grupo básico",
  description: "Una elección entre pocas alternativas, todas visibles sin abrir nada.",
  caption: "options: RadioOption[], con defaultValue para dejar una preseleccionada",
};

const OPTIONS = [
  { value: "transformacion", label: "Transformación" },
  { value: "bau", label: "BAU" },
  { value: "sin-clasificar", label: "Sin clasificar" },
];

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <RadioGroup label="Clasificación" options={OPTIONS} defaultValue="bau" />
    </div>
  );
}
