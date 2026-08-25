import { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "@tuya-ui/components";

export const meta = {
  title: "Otro tamaño",
  description: "size=\"md\" para un formulario corto que necesita más espacio que la confirmación por defecto.",
  caption: "Modal size=\"sm\" | \"md\" | \"lg\" — 480 / 640 / 880px",
};

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Editar capacidad
      </Button>
      <Modal open={open} onOpenChange={setOpen} size="md">
        <ModalHeader title="Editar capacidad de la célula" />
        <ModalBody>Este formulario es más ancho porque compara varios campos lado a lado.</ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Guardar
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
