import { useState } from "react";
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from "@tuya-ui/components";

export const meta = {
  title: "Detalle de fila",
  description: "El caso del mockup: la capacidad de una persona, consultada sin perder la tabla detrás.",
  caption: "Drawer open={open} onOpenChange={setOpen} — la tabla nunca se desmonta detrás",
};

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Ver detalle
      </Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerHeader eyebrow="Capacidad" title="María González" />
        <DrawerBody>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-body-sm">
              <span className="text-neutral-subtle">Célula</span>
              <span className="font-medium text-neutral-default">Backend Platform</span>
            </div>
            <div className="flex justify-between text-body-sm">
              <span className="text-neutral-subtle">Asignación</span>
              <span className="font-semibold text-danger-default">110%</span>
            </div>
            <div className="flex justify-between text-body-sm">
              <span className="text-neutral-subtle">Horas sprint 16</span>
              <span className="font-medium text-neutral-default">38.5</span>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Rebalancear
          </Button>
        </DrawerFooter>
      </Drawer>
    </>
  );
}
