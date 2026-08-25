import { Button } from "@tuya-ui/components";

export const meta = {
  title: "Variantes",
  description:
    "Primaria para la acción principal, secundaria para las de apoyo, sutil para acciones de baja jerarquía, destructiva para acciones irreversibles y de enlace para navegación inline. Las sólidas declaran su zona activa por el relleno y la secundaria por un borde, sin necesidad de hover. Sutil y enlace quedan sin caja a propósito: es lo que las separa de la secundaria. Las cinco ocupan la misma caja, así que se alinean al mezclarlas en una fila como esta.",
  caption: "variant: primary · secondary · subtle · danger · link",
};

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Guardar cambios</Button>
      <Button variant="secondary">Cancelar</Button>
      <Button variant="subtle">Descartar</Button>
      <Button variant="danger">Eliminar cuenta</Button>
      <Button variant="link">Ver detalles</Button>
    </div>
  );
}
