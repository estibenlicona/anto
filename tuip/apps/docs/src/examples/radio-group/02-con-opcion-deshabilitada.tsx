import { RadioGroup } from "@tuya-ui/components";

export const meta = {
  title: "Con opción deshabilitada",
  description: "Una alternativa individual puede quedar fuera de alcance sin deshabilitar el grupo entero.",
  caption: "options[].disabled, independiente de la prop disabled del grupo",
};

const OPTIONS = [
  { value: "backend-platform", label: "Backend Platform" },
  { value: "fraude-tarjetas", label: "Fraude Tarjetas" },
  { value: "core-bancario", label: "Core Bancario (sin cupo)", disabled: true },
];

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <RadioGroup label="Célula" options={OPTIONS} defaultValue="backend-platform" />
    </div>
  );
}
