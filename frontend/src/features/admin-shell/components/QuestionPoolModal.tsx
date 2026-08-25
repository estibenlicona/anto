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
import { QUESTION_DIMENSIONS } from "../services/questionPoolService";
import { useQuestionPool } from "../hooks/useQuestionPool";

export interface QuestionPoolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** El mismo hook que sostiene la tabla resumen, para que guardar se refleje sin recargar. */
  pool: ReturnType<typeof useQuestionPool>;
}

/** El mismo rótulo que usan las cabeceras de la tabla, para que el editor se lea como ella. */
const columnHeading = "text-label uppercase text-neutral-subtle";

/** Texto + peso + la acción de quitar. La dimensión no es una columna: la fija el grupo. */
const rowColumns = "minmax(0,1fr) 5.5rem auto";

/**
 * `@tuya-ui/components/styles.css` es un CSS ya compilado: sólo contiene las
 * clases que literalmente aparecen en `packages/components/src` de tuip. Este
 * paquete (`frontend`) no tiene su propio preset de Tailwind registrado, así
 * que una combinación de utilidades que no exista ya en el código fuente de
 * tuip no genera ninguna regla acá — se escribe la clase, pero no hace nada.
 * Por eso este archivo evita `gap-5`, `gap-6`, `gap-x-*`/`gap-y-*` sueltos y
 * `hover:text-danger-default`: no están en ese CSS. Antes de usar una clase
 * nueva en este directorio, conviene confirmar que ya se use en algún
 * componente de tuip.
 */

/**
 * Agrupado por dimensión, en el orden de referencia del modelo — el mismo
 * criterio que la tabla resumen. La dimensión no se edita por fila: agregar
 * una pregunta dentro de un grupo ya la asigna a esa dimensión, así que no
 * hace falta un selector de dimensión por pregunta.
 *
 * Editar, agregar y quitar se confirman juntos. No son operaciones aparte con
 * su propio guardado: son cambios sobre la misma lista, y separarlas
 * obligaría a decidir qué pasa si alguien agrega una pregunta y después
 * cancela.
 */
export const QuestionPoolModal: React.FC<QuestionPoolModalProps> = ({
  open,
  onOpenChange,
  pool,
}) => {
  const {
    values,
    errors,
    saving,
    saveError,
    canSave,
    setRowTexto,
    setRowPeso,
    addRow,
    removeRow,
    discard,
    save,
  } = pool;

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

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) discard();
        onOpenChange(next);
      }}
      size="lg"
    >
      <ModalHeader title="Editar preguntas" />
      <ModalBody>
        <div className="flex flex-col gap-4">
          {QUESTION_DIMENSIONS.map((dimension) => (
            <div key={dimension} className="flex flex-col gap-3">
              <h3 className="text-body font-semibold text-neutral-default">
                {dimension}
              </h3>
              <div
                className="grid items-start gap-3"
                style={{ gridTemplateColumns: rowColumns }}
              >
                <span className={columnHeading}>Pregunta</span>
                <span className={columnHeading}>Peso</span>
                <span aria-hidden="true" />

                {values.map((row, index) => {
                  if (row.dimension !== dimension) return null;
                  const rowErrors = errors[index] ?? {};
                  return (
                    <React.Fragment key={row.id}>
                      <Input
                        aria-label={`Texto de la pregunta ${row.id}`}
                        value={row.texto}
                        error={rowErrors.texto}
                        onChange={(event) =>
                          setRowTexto(index, event.target.value)
                        }
                      />
                      <Input
                        aria-label={`Peso de la pregunta ${row.id}`}
                        type="number"
                        min="1"
                        step="1"
                        value={row.peso}
                        error={rowErrors.peso}
                        onChange={(event) =>
                          setRowPeso(index, event.target.value)
                        }
                      />
                      <button
                        type="button"
                        // El código, no el texto: es el mismo identificador
                        // que ya nombra los otros dos campos de la fila, y una
                        // pregunta recién agregada todavía no tiene texto.
                        aria-label={`Quitar la pregunta ${row.id}`}
                        onClick={() => removeRow(index)}
                        className="mt-1.5 flex h-9 w-9 items-center justify-center rounded-control text-neutral-subtle outline-none hover:bg-neutral-subtle-hover focus-visible:ring-focus focus-visible:ring-neutral-focus-ring"
                      >
                        <Icon name="delete" size={20} />
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              <Button
                variant="secondary"
                className="self-start"
                onClick={() => addRow(dimension)}
              >
                Agregar pregunta
              </Button>
            </div>
          ))}

          {saveError && (
            <Alert
              variant="danger"
              title="No se pudo guardar el pool de preguntas"
            >
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
          {saving ? "Guardando…" : "Guardar preguntas"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
