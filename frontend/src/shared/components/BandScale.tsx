import React from "react";

export interface BandScaleBand {
  /** Nombre de la banda, bajo su tramo. */
  label: string;
  /** Extremos inclusivos dentro del dominio de la escala. */
  from: number;
  to: number;
}

export interface BandScaleProps {
  /** Las bandas, contiguas y en orden. Su ancho relativo **es** el dato. */
  bands: BandScaleBand[];
  /** Dónde cae el valor medido. Sin él la escala se dibuja sin marca. */
  value?: number;
  min?: number;
  max?: number;
  /** `label` de la banda que el valor alcanzó, para resaltarla. */
  activeBand?: string;
  /** Nombre accesible de la escala. */
  label: string;
  className?: string;
}

/**
 * Una escala de bandas contiguas de ancho desigual, con la marca del valor
 * medido encima.
 *
 * **Propuesta de componente de tuip** (`band-scale.tsx`). Vive acá y no en el
 * catálogo porque tuip se consume como tarball local y promoverlo pide
 * republicar el paquete y subir la dependencia; el hueco, en cambio, ya
 * existía: este bloque estaba escrito a mano en `ResultStep` con un comentario
 * que lo declaraba brecha.
 *
 * No se compone con lo que hay. `Slider` con `segments` dibuja los mismos
 * tramos pero es el **editor** —manijas arrastrables, sin marca de valor—;
 * `LevelMeter` sí tiene la marca (`expected`) pero sus pasos son iguales a
 * propósito, que es justo lo contrario de lo que una escala de bandas necesita:
 * acá el ancho de cada tramo es la información.
 *
 * Los extremos son inclusivos: una banda 0–20 y la siguiente 21–40 no dejan un
 * hueco, así que el ancho de cada una se cuenta sobre `to - from + 1` y los
 * tramos suman el dominio entero.
 */
export const BandScale: React.FC<BandScaleProps> = ({
  bands,
  value,
  min = 0,
  max = 100,
  activeBand,
  label,
  className = "",
}) => {
  const span = max - min + 1;
  const widthOf = (band: BandScaleBand) =>
    `${((band.to - band.from + 1) / span) * 100}%`;
  const marked =
    value !== undefined
      ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
      : null;

  return (
    <div
      role="img"
      aria-label={value !== undefined ? `${label}: ${value} de ${max}` : label}
      className={`flex flex-col gap-1.5 ${className}`}
    >
      <div className="relative flex h-2.5 overflow-visible rounded-pill">
        {bands.map((band) => (
          <span
            key={band.label}
            title={`${band.label}: ${band.from}–${band.to}`}
            className={`h-full first:rounded-l-pill last:rounded-r-pill ${
              band.label === activeBand
                ? "bg-neutral-bold"
                : "bg-neutral-subtle"
            }`}
            style={{ width: widthOf(band) }}
          />
        ))}
        {marked !== null && (
          // El aro del color de la superficie separa la marca de la banda que
          // tenga debajo, que puede ser la resaltada y del mismo tono.
          <span
            aria-hidden="true"
            className="absolute -translate-x-1/2 rounded-pill border-2 border-neutral-default bg-neutral-bold"
            style={{ left: `${marked}%`, height: 18, width: 18, top: -4 }}
          />
        )}
      </div>
      <div className="flex font-mono text-label font-normal tracking-normal text-neutral-subtle">
        {bands.map((band) => (
          <span key={band.label} style={{ width: widthOf(band) }}>
            {band.label}
          </span>
        ))}
      </div>
    </div>
  );
};
