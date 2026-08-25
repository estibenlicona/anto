import { Input } from "@tuya-ui/components";

export const meta = {
  title: "Estado de error",
  description:
    "Pasar `error` colorea el borde, muestra el mensaje y marca el campo como inválido para las tecnologías de asistencia.",
  caption: "error: colorea el borde, muestra el mensaje y aplica aria-invalid",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <Input
        label="Correo electrónico"
        defaultValue="hola@tuya.ca"
        error="Este correo ya está registrado"
      />
    </div>
  );
}
