import React from "react";
import {
  Alert,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Slider,
  Tag,
  type TagColor,
} from "@tuya-ui/components";
import {
  TALLA_MIN_BAND_WIDTH,
  TALLA_RANGE_MAX,
  TALLA_RANGE_MIN,
  bandRange,
  type TallaBoundaries,
} from "../services/tallaBandsService";
import { useTallaBands } from "../hooks/useTallaBands";

interface EditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** El mismo hook que sostiene la tabla, para que guardar se refleje sin recargar. */
  bands: ReturnType<typeof useTallaBands>;
  /** Color por talla. Es presentación de la pantalla, no dato del modelo. */
  colors: Record<string, TagColor>;
}

interface EditorShellProps extends Omit<EditorProps, "colors"> {
  title: string;
  size: "md" | "lg";
  confirmLabel: string;
  children: React.ReactNode;
}

/** El mismo rótulo que usan las cabeceras de la tabla, para que el editor se lea como ella. */
const columnHeading = "text-label uppercase text-neutral-subtle";

/**
 * Lo que los dos editores hacen igual: acumular, confirmar de una vez, cerrar
 * al lograrlo, y ante un error quedarse abiertos con lo editado. Vive en un
 * solo lugar para que no se separen con el tiempo — lo único que los distingue
 * debería ser qué muestran.
 *
 * Cada editor acumula sus cambios y se confirma de una vez: si cada movimiento
 * del slider guardara, un arrastre dispararía una ráfaga de peticiones y
 * dejaría persistidos estados intermedios que nadie pidió.
 */
const EditorShell: React.FC<EditorShellProps> = ({
  open,
  onOpenChange,
  bands,
  title,
  size,
  confirmLabel,
  children,
}) => {
  const { saving, saveError, canSave, discard, save } = bands;

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
      size={size}
    >
      <ModalHeader title={title} />
      <ModalBody>
        <div className="flex flex-col gap-5">
          {children}
          {saveError && (
            <Alert variant="danger" title="No se pudieron guardar las bandas">
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
          {saving ? "Guardando…" : confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

/**
 * Reparto de porcentajes y nada más. Es una decisión visual sobre el conjunto
 * —se toma arrastrando y mirando—, así que va sola y con el ancho más grande
 * del catálogo: la barra representa 0–100% de punta a punta y cada píxel es
 * precisión de arrastre.
 */
export const TallaRangesModal: React.FC<EditorProps> = ({
  open,
  onOpenChange,
  bands,
  colors,
}) => {
  const { values, setBoundaries } = bands;
  if (!values) return null;

  return (
    <EditorShell
      open={open}
      onOpenChange={onOpenChange}
      bands={bands}
      title="Editar reparto de porcentajes"
      size="lg"
      confirmLabel="Guardar reparto"
    >
      <p className="text-body-sm text-neutral-subtle">
        Arrastrá un límite para repartir el puntaje entre las dos bandas que
        separa. Ninguna puede quedar con menos de {TALLA_MIN_BAND_WIDTH} puntos.
      </p>
      <Slider
        value={values.boundaries}
        onValueChange={(next) => setBoundaries(next as TallaBoundaries)}
        min={TALLA_RANGE_MIN}
        max={TALLA_RANGE_MAX}
        minDistance={TALLA_MIN_BAND_WIDTH}
        segments={values.bands.map((band) => ({
          label: band.talla,
          color: colors[band.talla] ?? "gray",
        }))}
      />
      {/* Una columna por banda, en el mismo orden que la barra: el número de
          cada una queda bajo su tramo en vez de envolverse en una fila suelta. */}
      <div className="grid grid-cols-5 gap-2">
        {values.bands.map((band, index) => {
          const range = bandRange(values.boundaries, index);
          return (
            <div key={band.talla} className="flex flex-col items-center gap-1">
              <Tag color={colors[band.talla] ?? "gray"}>{band.talla}</Tag>
              <span className="font-mono text-body-sm text-neutral-subtle">
                {range.from}–{range.to}%
              </span>
            </div>
          );
        })}
      </div>
    </EditorShell>
  );
};

/**
 * Persona-mes y lectura de cada banda. Es un formulario que se completa
 * leyendo, no arrastrando, así que no muestra los límites.
 *
 * Va como una grilla que refleja la tabla que edita: los rótulos de columna una
 * sola vez arriba y una fila por banda. Repetirlos en cada banda —que es como
 * estaba— hacía que quince campos ocuparan más alto que el modal y que el
 * editor no se pareciera en nada a lo que está editando. Sin rótulo visible,
 * cada campo lleva su nombre accesible: si no, quedan quince cajas sin nombre.
 */
export const TallaDataModal: React.FC<EditorProps> = ({
  open,
  onOpenChange,
  bands,
  colors,
}) => {
  const { values, errors, setBandField } = bands;
  if (!values) return null;

  return (
    <EditorShell
      open={open}
      onOpenChange={onOpenChange}
      bands={bands}
      title="Editar datos de las bandas"
      size="md"
      confirmLabel="Guardar datos"
    >
      <div className="grid grid-cols-[3rem_5.5rem_5.5rem_1fr] items-start gap-x-3 gap-y-3">
        <span className={columnHeading}>Talla</span>
        <span className={columnHeading}>PM mín</span>
        <span className={columnHeading}>PM máx</span>
        <span className={columnHeading}>Lectura</span>

        {values.bands.map((band, index) => {
          const bandErrors = errors[index] ?? {};
          return (
            <React.Fragment key={band.talla}>
              {/* La píldora es más baja que la caja del campo; este margen la
                  alinea con el texto de la fila en vez de con su borde. */}
              <Tag color={colors[band.talla] ?? "gray"} className="mt-1.5">
                {band.talla}
              </Tag>
              <Input
                aria-label={`Persona-mes mínimo de ${band.talla}`}
                type="number"
                step="0.5"
                value={band.pmMin}
                error={bandErrors.pmMin}
                onChange={(event) =>
                  setBandField(index, "pmMin", event.target.value)
                }
              />
              <Input
                aria-label={`Persona-mes máximo de ${band.talla}`}
                type="number"
                step="0.5"
                value={band.pmMax}
                error={bandErrors.pmMax}
                onChange={(event) =>
                  setBandField(index, "pmMax", event.target.value)
                }
              />
              <Input
                aria-label={`Lectura de ${band.talla}`}
                value={band.lectura}
                error={bandErrors.lectura}
                onChange={(event) =>
                  setBandField(index, "lectura", event.target.value)
                }
              />
            </React.Fragment>
          );
        })}
      </div>
    </EditorShell>
  );
};
