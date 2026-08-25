import { Link } from "@tuya-ui/components";
import { Link as RouterLink } from "react-router";

export const meta = {
  title: "Sobre el enlace de un router",
  description:
    "Link no conoce ningún router. Con `asChild` cede su etiqueta al hijo, así que sale un único ancla con el estilo del sistema y la navegación del router — sin recargar la aplicación y sin anidar dos anclas. El alias va en el import del router, para que el JSX se lea con el nombre de la pieza del sistema.",
  caption: "asChild + el Link del router como hijo",
};

export default function Example() {
  return (
    <p className="text-body-sm text-neutral-default">
      Revisá la{" "}
      <Link asChild tone="neutral">
        <RouterLink to="#">capacidad del chapter</RouterLink>
      </Link>{" "}
      antes de asignar el sprint.
    </p>
  );
}
