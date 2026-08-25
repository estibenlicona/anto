import { Sparkline } from "@tuya-ui/components";

export const meta = {
  title: "Tendencia en una card de resumen",
  description:
    "La cifra dice cuánto cambió; la serie dice si viene bajando o rebotó. El último punto es el presente y lleva el tono; el resto es contexto.",
  caption: "Sparkline de seis ciclos junto a su delta",
};

export default function Example() {
  const puntos = [
    { label: "2024-S1", value: 12 },
    { label: "2024-S2", value: 11 },
    { label: "2025-S1", value: 8 },
    { label: "2025-S2", value: 9 },
    { label: "2026-S1", value: 6 },
    { label: "2026-S2", value: 5 },
  ];

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <span className="text-label text-neutral-subtle">VS. CICLO ANTERIOR</span>
      <div className="flex items-end gap-3">
        <span className="text-metric text-neutral-default">−1</span>
        <Sparkline points={puntos} label="Brechas por ciclo" className="flex-1" />
      </div>
      <span className="text-body-sm text-neutral-subtle">brecha menos que el ciclo pasado</span>
    </div>
  );
}
