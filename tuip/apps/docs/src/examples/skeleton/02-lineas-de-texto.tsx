import { Skeleton } from "@tuya-ui/components";

export const meta = {
  title: "Líneas de texto",
  description: "Un párrafo anticipado con líneas de distinto ancho, para que no se vea como una barra uniforme.",
  caption: "el último renglón más corto, como termina un párrafo real",
};

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
