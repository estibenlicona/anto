import { Button, Card, CardBody, CardFooter, CardHeader } from "@tuya-ui/components";

export const meta = {
  title: "Composición completa",
  description:
    "Card no impone contenido: se compone con header, body y footer según lo que necesites. El contorno de la tarjeta es más marcado que las líneas que separan sus partes — así se distingue dónde termina la tarjeta de dónde termina una de sus secciones.",
  caption: "CardHeader · CardBody · CardFooter, con el mismo padding en las tres",
};

export default function Example() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <span className="font-semibold text-neutral-default">Plan Empresarial</span>
      </CardHeader>
      <CardBody>
        <p className="text-body-sm text-neutral-subtle">
          Incluye usuarios ilimitados, soporte prioritario y auditoría de accesos.
        </p>
      </CardBody>
      <CardFooter>
        <Button variant="primary">Contratar</Button>
      </CardFooter>
    </Card>
  );
}
