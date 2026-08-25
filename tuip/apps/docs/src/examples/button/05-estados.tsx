import { useState } from "react";
import { Button } from "@tuya-ui/components";

export const meta = {
  title: "Estados",
  description:
    "Un botón deshabilitado se atenúa y no responde. En carga muestra el indicador, bloquea el click y se anuncia como ocupado.",
  caption: "disabled e isLoading — el segundo también aplica aria-busy",
};

export default function Example() {
  const [loading, setLoading] = useState(false);

  function submit() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={submit} isLoading={loading}>
        {loading ? "Guardando…" : "Guardar"}
      </Button>
      <Button variant="secondary" disabled>
        Deshabilitado
      </Button>
      <Button variant="danger" isLoading>
        Eliminando…
      </Button>
    </div>
  );
}
