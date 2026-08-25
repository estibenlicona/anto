import { Select } from "@tuya-ui/components";

export const meta = {
  title: "Campo básico",
  description: "Entre 7 y 20 opciones, con la etiqueta asociada al trigger.",
  caption: "label asociado al trigger por un id generado",
};

const OPTIONS = [
  { value: "backend-platform", label: "Backend Platform" },
  { value: "fraude-tarjetas", label: "Fraude Tarjetas" },
  { value: "canales-digitales", label: "Canales Digitales" },
  { value: "core-bancario", label: "Core Bancario" },
  { value: "experiencia-cliente", label: "Experiencia Cliente" },
  { value: "seguridad", label: "Seguridad" },
  { value: "datos-analitica", label: "Datos y Analítica" },
];

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <Select label="Célula" placeholder="Seleccionar…" options={OPTIONS} />
    </div>
  );
}
