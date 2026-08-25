import { Badge } from "@tuya-ui/components";

export const meta = {
  title: "Estado o clasificación",
  description:
    "El punto marca que lo que el badge dice es una **condición**: algo que está pasando y puede dejar de pasar. Sobre una clasificación fija —el nivel de una escala, la criticidad de algo— no dice nada y compite con la etiqueta que ya la da. La pregunta es de contenido, no de estética.",
  caption: "Arriba con punto porque son estados; abajo sin él porque son niveles",
};

export default function Example() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">En curso</Badge>
        <Badge variant="success">Sincronizada</Badge>
        <Badge variant="neutral">Cerrada</Badge>
        <Badge variant="danger">Con error</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="danger" dot={false}>
          Crítica
        </Badge>
        <Badge variant="warning" dot={false}>
          Alta
        </Badge>
        <Badge variant="info" dot={false}>
          Media
        </Badge>
        <Badge variant="neutral" dot={false}>
          Baja
        </Badge>
      </div>
    </div>
  );
}
