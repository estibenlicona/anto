import React from "react";
import {
  Alert,
  Button,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@tuya-ui/components";
import { mixAmount } from "../services/capabilityMixService";
import { useCapabilityMix } from "../hooks/useCapabilityMix";

export interface CapabilityMixModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** El mismo hook que sostiene la tabla, para que guardar se refleje sin recargar. */
  mix: ReturnType<typeof useCapabilityMix>;
  /** Las tallas llegan desde afuera: el editor no sabe que salen de las bandas. */
  tallas: string[];
}

/** El mismo rótulo que usan las cabeceras de la tabla, para que el editor se lea como ella. */
const columnHeading = "text-label uppercase text-neutral-subtle";

/**
 * Matriz completa: una fila por capacidad, una columna por talla, y los
 * rótulos de columna una sola vez arriba — el mismo criterio que el editor de
 * datos de bandas.
 *
 * Editar, agregar y quitar se confirman juntos. No son operaciones aparte con
 * su propio guardado: son cambios sobre la misma matriz, y separarlas
 * obligaría a decidir qué pasa si alguien agrega una fila y después cancela.
 */
export const CapabilityMixModal: React.FC<CapabilityMixModalProps> = ({
  open,
  onOpenChange,
  mix,
  tallas,
}) => {
  const {
    values,
    errors,
    saving,
    saveError,
    canSave,
    setRowName,
    setRowAmount,
    addRow,
    removeRow,
    discard,
    save,
  } = mix;

  if (!values) return null;

  const close = () => {
    discard();
    onOpenChange(false);
  };

  const confirm = async () => {
    const result = await save();
    // El resultado se lee del retorno y no de `saveError`: después del await,
    // el estado del hook todavía es el de la closure de este render.
    if (result.success) onOpenChange(false);
  };

  // Nombre + una columna por talla + la acción de quitar.
  const columns = `minmax(9rem,1fr) repeat(${tallas.length}, 4.5rem) auto`;

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) discard();
        onOpenChange(next);
      }}
      size="lg"
    >
      <ModalHeader title="Editar mix de capacidades" />
      <ModalBody>
        <div className="flex flex-col gap-5">
          <div
            className="grid items-start gap-x-3 gap-y-3"
            style={{ gridTemplateColumns: columns }}
          >
            <span className={columnHeading}>Capacidad</span>
            {tallas.map((talla) => (
              <span key={talla} className={columnHeading}>
                {talla}
              </span>
            ))}
            {/* La columna de acciones no lleva rótulo, pero sí una celda: un
                `sr-only` acá no serviría — es `position: absolute`, sale del
                flujo del grid y correría toda la matriz una columna. Cada botón
                de quitar ya se nombra solo. */}
            <span aria-hidden="true" />

            {values.map((row, index) => (
              <React.Fragment key={row.id}>
                <Input
                  aria-label={`Nombre de la capacidad ${index + 1}`}
                  value={row.capacidad}
                  error={errors[index]?.capacidad}
                  onChange={(event) => setRowName(index, event.target.value)}
                />
                {tallas.map((talla) => (
                  <Input
                    key={talla}
                    aria-label={`${talla} de ${row.capacidad || `la capacidad ${index + 1}`}`}
                    type="number"
                    min="0"
                    step="1"
                    value={mixAmount(row, talla)}
                    onChange={(event) =>
                      setRowAmount(index, talla, event.target.value)
                    }
                  />
                ))}
                <button
                  type="button"
                  aria-label={`Quitar ${row.capacidad || `la capacidad ${index + 1}`}`}
                  onClick={() => removeRow(index)}
                  className="mt-1.5 flex h-9 w-9 items-center justify-center rounded-control text-neutral-subtle outline-none hover:bg-neutral-subtle-hover hover:text-danger-default focus-visible:ring-focus focus-visible:ring-border-brand-focus"
                >
                  <Icon name="delete" size={20} />
                </button>
              </React.Fragment>
            ))}
          </div>

          <Button
            variant="secondary"
            className="self-start"
            onClick={() => addRow(tallas)}
          >
            Agregar capacidad
          </Button>

          {saveError && (
            <Alert variant="danger" title="No se pudo guardar el mix">
              {saveError}
            </Alert>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={close} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={confirm} disabled={!canSave}>
          {saving ? "Guardando…" : "Guardar mix"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
