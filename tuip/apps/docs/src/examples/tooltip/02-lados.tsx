import { Button, Tooltip } from "@tuya-ui/components";

export const meta = {
  title: "Distintos lados",
  description: "El lado y la alineación se controlan con `side` y `align`, resueltos por Radix contra el espacio disponible.",
  caption: "Tooltip side=\"top\" | \"right\" | \"bottom\" | \"left\"",
};

export default function Example() {
  return (
    <div className="flex items-center gap-4">
      <Tooltip content="Arriba" side="top">
        <Button variant="secondary">Arriba</Button>
      </Tooltip>
      <Tooltip content="Derecha" side="right">
        <Button variant="secondary">Derecha</Button>
      </Tooltip>
      <Tooltip content="Abajo" side="bottom">
        <Button variant="secondary">Abajo</Button>
      </Tooltip>
    </div>
  );
}
