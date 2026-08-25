import { Navbar } from "@tuya-ui/components";

export const meta = {
  title: "Variante light, sin selector de apps",
  description: "Para apps de consulta o pantallas que se proyectan. Sin la prop `apps`, la marca es texto plano — no abre nada.",
  caption: "una lista vacía de apps hace que la marca deje de comportarse como un control",
};

export default function Example() {
  return (
    <Navbar
      variant="light"
      product="Directorio TI"
      onSearch={() => {}}
      user={{ name: "Julián Ortega", role: "Soporte N2", initials: "JO" }}
      userMenu={[{ label: "Mi perfil" }, { label: "Cerrar sesión", destructive: true }]}
    />
  );
}
