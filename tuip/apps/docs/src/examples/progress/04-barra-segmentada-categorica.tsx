import { SegmentedBar } from "@tuya-ui/components";

export const meta = {
  title: "Barra segmentada con color categórico",
  description:
    "Una distribución entre categorías sin significado de estado ni orden entre sí, cada una con un color del vocabulario categórico.",
  caption: "SegmentedBar con color categórico en vez de rol de estado",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <SegmentedBar
        segments={[
          { value: 4, color: "gray", label: "Interno" },
          { value: 3, color: "amber", label: "Proveedor A" },
          { value: 2, color: "blue", label: "Proveedor B" },
          { value: 1, color: "purple", label: "Freelance" },
        ]}
      />
    </div>
  );
}
