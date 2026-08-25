import { Select } from "@tuya-ui/components";

export const meta = {
  title: "Deshabilitado",
  description: "Fuera del flujo de tabulación, con el mismo tratamiento visual que Input.",
  caption: "disabled: true",
};

const OPTIONS = [{ value: "backend-development", label: "Backend Development" }];

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <Select
        label="Chapter"
        defaultValue="backend-development"
        options={OPTIONS}
        disabled
      />
    </div>
  );
}
