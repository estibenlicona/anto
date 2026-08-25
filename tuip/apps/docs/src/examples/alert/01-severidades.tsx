import { Alert } from "@tuya-ui/components";

export const meta = {
  title: "Severidades",
  description: "Las cuatro severidades, cada una con su propio ícono.",
  caption: "variant: danger · warning · success · info",
};

export default function Example() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert variant="danger">No se pudo guardar el cambio. Intentá de nuevo.</Alert>
      <Alert variant="warning">
        Tres capacidades no tienen usuario de DevOps vinculado.
      </Alert>
      <Alert variant="success">Los cambios se guardaron correctamente.</Alert>
      <Alert variant="info">La estimación se recalcula cada noche.</Alert>
    </div>
  );
}
