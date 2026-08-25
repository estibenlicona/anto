import { Button } from "@tuya-ui/components";

export const meta = {
  title: "Solo ícono",
  description:
    "Sin texto visible el ícono no alcanza como nombre accesible, así que hay que pasar `aria-label` con la acción.",
  caption: "sin etiqueta visible: el nombre accesible lo aporta aria-label",
};

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2.5 3.5h9M5.5 3.5V2h3v1.5M3.5 3.5l.5 8h6l.5-8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="subtle" aria-label="Eliminar registro" iconBefore={<TrashIcon />} />
      <Button variant="danger" aria-label="Eliminar definitivamente" iconBefore={<TrashIcon />} />
    </div>
  );
}
