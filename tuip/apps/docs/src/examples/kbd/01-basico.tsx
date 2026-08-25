import { Kbd } from "@tuya-ui/components";

export const meta = {
  title: "Atajos al pie de una cola",
  description:
    "Las teclas se documentan como teclas, en mono y sin foco. Quién escucha el atajo es la pantalla; Kbd sólo lo cuenta.",
  caption: "Kbd sm entre texto de ayuda",
};

export default function Example() {
  return (
    <p className="inline-flex flex-wrap items-center gap-2 text-body-sm text-neutral-subtle">
      <Kbd size="sm">1</Kbd>
      <Kbd size="sm">2</Kbd>
      <Kbd size="sm">3</Kbd>
      elegir · <Kbd size="sm">↵</Kbd> guardar y seguir · <Kbd size="sm">S</Kbd> saltar
    </p>
  );
}
