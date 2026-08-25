import { Link } from "@tuya-ui/components";

export const meta = {
  title: "Los dos tonos",
  description:
    "En reposo el enlace de marca se distingue por su color; el neutro es indistinguible del texto que lo rodea. Pasá el puntero sobre los dos, o recorrelos con Tab, para ver aparecer el subrayado.",
  caption: 'tone="brand" (por defecto) · tone="neutral"',
};

export default function Example() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-neutral-default">
        Revisá la <Link href="#">capacidad del chapter</Link> antes de asignar el sprint.
      </p>
      <p className="text-body-sm text-neutral-default">
        Revisá la{" "}
        <Link href="#" tone="neutral">
          capacidad del chapter
        </Link>{" "}
        antes de asignar el sprint.
      </p>
    </div>
  );
}
