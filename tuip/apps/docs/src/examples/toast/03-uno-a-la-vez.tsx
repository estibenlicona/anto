import { Button, ToastProvider, useToast } from "@tuya-ui/components";

export const meta = {
  title: "Uno a la vez",
  description: "Disparar varios toasts en fila los encola: el segundo espera a que el primero termine, en vez de superponerse.",
  caption: "tres toast() seguidos, un único Toast.Root montado por vez",
};

function Trigger() {
  const { toast } = useToast();

  function fireThree() {
    toast({ message: "Primero" });
    toast({ message: "Segundo" });
    toast({ message: "Tercero" });
  }

  return (
    <Button variant="secondary" onClick={fireThree}>
      Disparar tres toasts
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
