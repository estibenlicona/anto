import { Avatar } from "@tuya-ui/components";

export const meta = {
  title: "Color por persona",
  description:
    "El color sale del identificador de cada persona, no de su nombre ni del orden de la lista: así no cambia cuando se corrige un dato ni al reordenar la tabla.",
  caption: "colorId: el id inmutable de la persona",
};

const people = [
  { id: "p-8f31", initials: "MG", name: "María González" },
  { id: "p-2b07", initials: "LR", name: "Laura Ruiz" },
  { id: "p-c519", initials: "CL", name: "Carlos López" },
  { id: "p-47ae", initials: "AM", name: "Andrés Martínez" },
  { id: "p-d6c2", initials: "PR", name: "Paula Ramírez" },
];

export default function Example() {
  return (
    <div className="flex items-center gap-4">
      {people.map((person) => (
        <Avatar key={person.id} colorId={person.id} label={person.name}>
          {person.initials}
        </Avatar>
      ))}
    </div>
  );
}
