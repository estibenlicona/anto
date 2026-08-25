import { Avatar, AvatarGroup } from "@tuya-ui/components";

export const meta = {
  title: "Grupo con overflow",
  description: "AvatarGroup superpone hasta max avatares y agrega un +N cuando hay más miembros.",
  caption: "AvatarGroup max={3} con 6 miembros",
};

const MEMBERS = [
  "María González",
  "Julián Pérez",
  "Laura Ruiz",
  "Carlos Mora",
  "Sofía Vargas",
  "Ana Ríos",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Example() {
  return (
    <AvatarGroup max={3}>
      {MEMBERS.map((name) => (
        <Avatar key={name} label={name}>
          {initials(name)}
        </Avatar>
      ))}
    </AvatarGroup>
  );
}
