import { Select } from "@tuya-ui/components";

export const meta = {
  title: "Opciones cargando",
  description:
    "Cuando la lista viene del backend, el desplegable muestra un estado de carga en vez de aparecer vacío.",
  caption: "loading: true — el desplegable ya se puede abrir mientras las opciones llegan",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <Select label="Célula" placeholder="Seleccionar…" options={[]} loading />
    </div>
  );
}
