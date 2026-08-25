import { Select } from "@tuya-ui/components";

export const meta = {
  title: "Estado de error",
  description:
    "Pasar `error` colorea el borde, muestra el mensaje y marca el campo como inválido para las tecnologías de asistencia.",
  caption: "error: colorea el borde, muestra el mensaje y aplica aria-invalid",
};

const OPTIONS = [
  { value: "backend-platform", label: "Backend Platform" },
  { value: "fraude-tarjetas", label: "Fraude Tarjetas" },
];

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <Select
        label="Célula"
        placeholder="Seleccionar…"
        options={OPTIONS}
        error="Elegí una célula para continuar"
      />
    </div>
  );
}
