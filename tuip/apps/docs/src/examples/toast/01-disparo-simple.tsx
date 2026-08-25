import { Button, Icon, ToastProvider, useToast } from "@tuya-ui/components";

export const meta = {
  title: "Disparo simple",
  description: "Confirma una acción del usuario y desaparece solo a los 5 segundos.",
  caption: "useToast().toast({ message, icon })",
};

function Trigger() {
  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast({
          message: "Cambios guardados",
          icon: <Icon name="status-success" size={20} />,
        })
      }
    >
      Guardar
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
