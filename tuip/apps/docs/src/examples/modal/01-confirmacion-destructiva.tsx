import { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "@tuya-ui/components";

export const meta = {
  title: "Confirmación destructiva",
  description: "El caso del mockup: eliminar una iniciativa, con el costo de deshacerlo explicado antes de confirmar.",
  caption: "Modal open={open} onOpenChange={setOpen} — el estado lo maneja quien lo dispara",
};

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Eliminar iniciativa
      </Button>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalHeader title="¿Eliminar la iniciativa?" />
        <ModalBody>
          «Migración Kafka» tiene 3.2 FTE asignados en dos células. Se liberarán al eliminarla. Esta acción no se
          puede deshacer.
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => setOpen(false)}>
            Eliminar iniciativa
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
