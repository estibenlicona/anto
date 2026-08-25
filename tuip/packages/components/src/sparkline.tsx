import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { AccentTone } from "@/lib/accent-tone";

export interface SparklinePoint {
  /** Qué período es este punto — "2025-S2", "Marzo". Viaja en el `title` de su barra. */
  label: string;
  value: number;
}

export interface SparklineProps extends HTMLAttributes<HTMLDivElement> {
  /** La serie, del período más viejo al más reciente. Vacía no dibuja nada. */
  points: SparklinePoint[];
  /**
   * El tono con el que se destaca el último punto — el presente. El resto de
   * la serie va en neutro.
   *
   * Es una prop y no una decisión del componente porque la serie no sabe si su
   * última cifra es una buena noticia: en brechas, bajar es mejorar; en
   * entregas, es lo contrario. Eso lo sabe la pantalla.
   */
  tone?: AccentTone;
  /** Nombre accesible de la serie completa. */
  label: string;
  /** Alto del área de dibujo. Por defecto 2rem, el de una card de resumen. */
  height?: string;
}

const toneFill: Record<AccentTone, string> = {
  sky: "bg-accent-sky-fill",
  blue: "bg-accent-blue-fill",
  violet: "bg-accent-violet-fill",
  magenta: "bg-accent-magenta-fill",
};

/** Piso visible: una barra de altura cero se lee como un período sin datos. */
const MIN_HEIGHT = "2px";

/**
 * Una serie corta como barras verticales, del período más viejo al más
 * reciente: la forma que acompaña a un número ya escrito al lado.
 *
 * No es un gráfico —no tiene ejes, cuadrícula ni cifras— y su escala es
 * relativa al mayor punto de su propia serie, que es lo único que puede saber
 * sin que le digan cuál es el máximo posible. Dos sparklines de dos cards no
 * son comparables entre sí, y no deberían leerse así.
 */
export function Sparkline({
  points,
  tone = "blue",
  label,
  height = "2rem",
  className,
  style,
  ...props
}: SparklineProps) {
  if (points.length === 0) return null;

  const max = Math.max(...points.map((p) => p.value));

  return (
    <div
      // Una sola imagen con su nombre: seis barras sin texto no le dicen nada
      // a quien recorre con un lector de pantalla, y obligar a pasar por ellas
      // convierte un apoyo visual en un obstáculo.
      role="img"
      aria-label={label}
      className={cn("flex items-end gap-1", className)}
      style={{ height, ...style }}
      {...props}
    >
      {points.map((point, index) => {
        const last = index === points.length - 1;
        return (
          <div
            key={`${point.label}-${index}`}
            aria-hidden="true"
            title={`${point.label}: ${point.value}`}
            className={cn(
              // El pasado en el gris pisado y no en el bold: la serie es
              // contexto detrás de una cifra, y con el neutro más oscuro
              // compite con ella en vez de sostenerla.
              "min-h-0.5 flex-1 rounded-t-control",
              last ? toneFill[tone] : "bg-neutral-subtle-pressed",
            )}
            style={{
              height:
                max > 0 ? `max(${MIN_HEIGHT}, ${(point.value / max) * 100}%)` : MIN_HEIGHT,
            }}
          />
        );
      })}
    </div>
  );
}

Sparkline.displayName = "Sparkline";
