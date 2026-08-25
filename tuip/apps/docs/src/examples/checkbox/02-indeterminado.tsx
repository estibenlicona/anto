import { useState } from "react";
import { Checkbox } from "@tuya-ui/components";

export const meta = {
  title: "Indeterminado",
  description: "Representa una selección parcial de un grupo — ni todo marcado ni todo desmarcado.",
  caption: "indeterminate: true, fijado vía ref sobre la propiedad DOM del input",
};

const ITEMS = ["Backend Platform", "Fraude Tarjetas", "Canales Digitales"];

export default function Example() {
  const [checked, setChecked] = useState<boolean[]>([true, false, false]);
  const allChecked = checked.every(Boolean);
  const someChecked = checked.some(Boolean) && !allChecked;

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="Todas las células"
        checked={allChecked}
        indeterminate={someChecked}
        onChange={(event) => setChecked(checked.map(() => event.target.checked))}
      />
      <div className="ml-6 flex flex-col gap-2">
        {ITEMS.map((item, index) => (
          <Checkbox
            key={item}
            label={item}
            checked={checked[index]}
            onChange={(event) =>
              setChecked(checked.map((value, i) => (i === index ? event.target.checked : value)))
            }
          />
        ))}
      </div>
    </div>
  );
}
