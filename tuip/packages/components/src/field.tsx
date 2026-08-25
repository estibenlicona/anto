import { cn } from "@/lib/cn";
import { ReactNode } from "react";

/**
 * Lo que todo campo con rótulo comparte: el asterisco de obligatorio, el
 * texto de ayuda, y a quién apunta `aria-describedby`. Vive acá y no
 * duplicado en cada control para que `Input` y `Select` no puedan divergir
 * en cómo marcan lo mismo.
 *
 * No se exporta desde el índice del paquete: son piezas internas, no
 * componentes del catálogo.
 */

export interface FieldLabelProps {
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldLabel({ htmlFor, required, children, className }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-body-sm font-medium text-neutral-default", className)}
    >
      {children}
      {required && (
        // `aria-hidden` porque lo obligatorio ya viaja en `aria-required` del
        // control: sin esto un lector de pantalla anuncia "asterisco" además
        // de "requerido".
        <span aria-hidden="true" className="ml-0.5 text-danger-default">
          *
        </span>
      )}
    </label>
  );
}

export interface FieldHintProps {
  error?: string;
  hint?: ReactNode;
  errorId?: string;
  hintId?: string;
}

/**
 * El error desplaza a la ayuda, no se apilan: si el campo está mal, lo que
 * el usuario necesita leer es qué corregir, no de dónde sale el valor.
 */
export function FieldHint({ error, hint, errorId, hintId }: FieldHintProps) {
  if (error) {
    return (
      <p id={errorId} className="text-body-sm text-danger-default">
        {error}
      </p>
    );
  }
  if (hint !== undefined && hint !== null && hint !== false) {
    return (
      <p id={hintId} className="text-body-sm text-neutral-subtle">
        {hint}
      </p>
    );
  }
  return null;
}

/** Los ids que `aria-describedby` necesita, derivados del id del control. */
export function useFieldDescription(fieldId: string, error?: string, hint?: ReactNode) {
  const errorId = error ? `${fieldId}-error` : undefined;
  const showHint = !error && hint !== undefined && hint !== null && hint !== false;
  const hintId = showHint ? `${fieldId}-hint` : undefined;
  return { errorId, hintId, describedBy: errorId ?? hintId };
}

/**
 * Borde por estado de un campo. Excluyentes, no acumulativas: `cn` sólo
 * concatena, así que dos clases que fijan el mismo color conviven en el
 * atributo y gana la que la hoja emita después — que resulta ser la neutra.
 * Emitir sólo una de las dos es lo que hace que el estado de error se vea.
 * Compartida por Input y Textarea para que los dos pinten igual.
 */
export const fieldStateClasses = (error: boolean) =>
  cn(!error && "border-neutral-default", error && "border-danger-default");

/** Anillo de foco por estado, par de `fieldStateClasses` para el elemento que recibe el foco. */
export const fieldFocusRingClasses = (error: boolean) =>
  cn(
    "focus-visible:outline-none focus-visible:ring-focus",
    !error && "focus-visible:ring-neutral-focus-ring",
    error && "focus-visible:ring-danger-focus-ring",
  );
