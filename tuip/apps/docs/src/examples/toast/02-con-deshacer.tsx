import { Button, ToastProvider, useToast } from "@tuya-ui/components";

export const meta = {
  title: "Con deshacer",
  description: "Al traer una acción, la duración por defecto pasa sola de 5 a 10 segundos.",
  caption: "toast({ message, action }) — action extiende la duración por defecto",
};

function Trigger() {
  const { toast } = useToast();

  return (
    <Button
      variant="danger"
      onClick={() =>
        toast({
          message: "Iniciativa eliminada",
          action: { label: "Deshacer", onClick: () => toast({ message: "Iniciativa restaurada" }) },
        })
      }
    >
      Eliminar iniciativa
    </Button>
  );
}

export default function Example() {
  return (
    <ToastProvider>
      <Trigger />
    </ToastProvider>
  );
}
