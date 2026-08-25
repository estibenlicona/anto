import { Combobox } from "@tuya-ui/components";

export const meta = {
  title: "Selección simple",
  description: "Más de 20 opciones: filtrar mientras se escribe es más rápido que recorrer la lista.",
  caption: "filtrado en vivo, sin exigir coincidencia exacta",
};

const OPTIONS = Array.from({ length: 24 }, (_, index) => ({
  value: `tuy-${4800 + index}`,
  label: `TUY-${4800 + index}`,
}));

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <Combobox label="Iniciativa" placeholder="Buscar por ID…" options={OPTIONS} />
    </div>
  );
}
