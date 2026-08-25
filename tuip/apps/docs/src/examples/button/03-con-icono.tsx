import { Button } from "@tuya-ui/components";

export const meta = {
  title: "Con ícono",
  description:
    "El ícono acompaña a la etiqueta y se oculta a las tecnologías de asistencia: el nombre accesible sigue siendo el texto.",
  caption: "iconBefore e iconAfter, con la etiqueta como nombre accesible",
};

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button iconBefore={<PlusIcon />}>Nuevo registro</Button>
      <Button variant="secondary" iconAfter={<ArrowIcon />}>
        Siguiente paso
      </Button>
    </div>
  );
}
