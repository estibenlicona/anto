import { Tag } from "@tuya-ui/components";

export const meta = {
  title: "Un color por miembro",
  description:
    "Cada miembro del conjunto lleva su propio color. El color no ordena ni califica — no dice que XL sea peor que XS, solo los separa.",
  caption: "color: gray · green · blue · amber · red",
};

const tallas = [
  { talla: "XS", color: "gray" },
  { talla: "S", color: "green" },
  { talla: "M", color: "blue" },
  { talla: "L", color: "amber" },
  { talla: "XL", color: "red" },
] as const;

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tallas.map((t) => (
        <Tag key={t.talla} color={t.color}>
          {t.talla}
        </Tag>
      ))}
    </div>
  );
}
