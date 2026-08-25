import { Alert, Button } from "@tuya-ui/components";

export const meta = {
  title: "Con título y acción",
  description: "El título es opcional; la acción es un Button real, no una prop de Alert.",
  caption: "title + action, con la acción compuesta por el consumidor",
};

export default function Example() {
  return (
    <div className="w-full max-w-xl">
      <Alert
        variant="danger"
        title="No se pudo sincronizar con Azure DevOps"
        action={
          <Button variant="link" size="small">
            Reintentar
          </Button>
        }
      >
        Último intento hoy a las 02:00. Los datos que ves son del sprint anterior.
      </Alert>
    </div>
  );
}
