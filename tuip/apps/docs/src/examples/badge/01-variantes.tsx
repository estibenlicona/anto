import { Badge } from "@tuya-ui/components";

export const meta = {
  title: "Variantes de estado",
  description: "Cada variante comunica un tono distinto, siempre con el punto de color junto al texto.",
  caption: "variant: success · info · warning · danger · neutral · discovery",
};

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="success">Sincronizado</Badge>
      <Badge variant="info">En progreso</Badge>
      <Badge variant="warning">Al límite</Badge>
      <Badge variant="danger">Error</Badge>
      <Badge variant="neutral">Sin iniciar</Badge>
      <Badge variant="discovery">Sugerido por IA</Badge>
    </div>
  );
}
