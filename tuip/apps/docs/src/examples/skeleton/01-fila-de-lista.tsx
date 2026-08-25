import { Skeleton } from "@tuya-ui/components";

export const meta = {
  title: "Fila de lista",
  description: "Un avatar circular y dos líneas de texto, imitando la fila real que va a reemplazar.",
  caption: "cada pieza es la misma Skeleton con distinto className",
};

export default function Example() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-pill" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-2.5 w-3/5" />
            <Skeleton className="h-2.5 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
