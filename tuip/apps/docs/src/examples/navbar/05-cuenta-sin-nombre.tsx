import { Navbar } from "@tuya-ui/components";

export const meta = {
  title: "Cuenta sin nombre en la barra",
  description:
    "Con showUserName={false} la cuenta se reduce al avatar y el nombre queda sólo dentro de su panel, junto al rol. Sirve cuando la barra necesita ese ancho para otra cosa; el nombre accesible del disparador no cambia, porque lo aporta el label del avatar. Sin la prop, el nombre acompaña al avatar desde 1120px.",
  caption: "Navbar clara con la cuenta reducida al avatar",
};

export default function Example() {
  return (
    <Navbar
      product="Dimensionamiento TI"
      variant="light"
      apps={[
        { id: "capacidad", name: "Gestión de Capacidad", color: "#C9151F", current: true },
        { id: "facturacion", name: "Facturación", color: "#2563EB" },
      ]}
      user={{ name: "Chapter Lead", role: "Tu chapter", initials: "CL" }}
      userMenu={[{ label: "Cerrar sesión", destructive: true }]}
      showUserName={false}
      utilities={[]}
    />
  );
}
