import { Card, CardBody } from "@tuya-ui/components";

export const meta = {
  title: "Solo cuerpo",
  description: "Header y footer son opcionales: para contenido simple basta con el cuerpo.",
  caption: "solo CardBody: header y footer son opcionales",
};

export default function Example() {
  return (
    <Card className="w-full max-w-sm">
      <CardBody>
        <p className="text-body-sm text-neutral-subtle">
          Tu sesión se cerrará automáticamente después de 30 minutos de inactividad.
        </p>
      </CardBody>
    </Card>
  );
}
