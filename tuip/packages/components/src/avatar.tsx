import { Children, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { identityColorFor, type IdentityColorName } from "@/lib/identity-color";

export type AvatarSize = "small" | "medium" | "large";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visible initials, e.g. "MG" — the consumer derives these from the full name. */
  children: ReactNode;
  /** Full name for assistive technology, when it differs from the visible initials. */
  label?: string;
  /** Circle diameter. */
  size?: AvatarSize;
  /**
   * Identificador **inmutable** de la persona, del que se deriva su color.
   * La misma entrada da siempre el mismo color, en cualquier pantalla y entre
   * sesiones, que es lo que hace que el color sirva para reconocerla.
   *
   * Tiene que ser un identificador estable, no un dato editable: pasar el
   * nombre o el correo hace que el color cambie cuando esos datos se corrigen.
   * Ese es el riesgo que esta prop existe para evitar, no uno que introduzca.
   *
   * Omitido, Avatar usa el relleno neutro.
   */
  colorId?: string;
  /**
   * Fuerza un color en vez de derivarlo. Para casos donde la persona no tiene
   * un identificador estable a mano; con `colorId` presente, éste manda.
   */
  color?: IdentityColorName;
}

const sizeClasses: Record<AvatarSize, string> = {
  small: "h-6 w-6",
  medium: "h-8 w-8",
  large: "h-10 w-10",
};

// Relleno tenue + texto del mismo tono en un paso oscuro, el par que Fluent
// usa para los avatares de Teams. Escrito literal por color, mismo motivo que
// `colorClasses` en tag.tsx: el JIT de Tailwind necesita el nombre completo de
// la clase en el código, así que un `bg-identity-${name}` armado en runtime no
// emitiría ningún CSS.
const colorClasses: Record<IdentityColorName, string> = {
  cranberry: "bg-identity-cranberry text-identity-cranberry",
  pumpkin: "bg-identity-pumpkin text-identity-pumpkin",
  brown: "bg-identity-brown text-identity-brown",
  brass: "bg-identity-brass text-identity-brass",
  forest: "bg-identity-forest text-identity-forest",
  darkGreen: "bg-identity-dark-green text-identity-dark-green",
  teal: "bg-identity-teal text-identity-teal",
  steel: "bg-identity-steel text-identity-steel",
  blue: "bg-identity-blue text-identity-blue",
  cornflower: "bg-identity-cornflower text-identity-cornflower",
  purple: "bg-identity-purple text-identity-purple",
  magenta: "bg-identity-magenta text-identity-magenta",
};

/** El relleno de quien no trae identificador ni color: neutro, sin identidad. */
const neutralClasses = "bg-neutral-subtle text-neutral-default";

export function Avatar({
  size = "medium",
  colorId,
  color,
  label,
  className,
  children,
  ...props
}: AvatarProps) {
  // `color` explícito gana; si no, se deriva de `colorId`; sin ninguno de los
  // dos, queda el neutro.
  const resolved = color ?? (colorId ? identityColorFor(colorId) : undefined);

  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-pill text-label font-semibold",
        sizeClasses[size],
        resolved ? colorClasses[resolved] : neutralClasses,
        className,
      )}
      {...props}
    >
      {/* `text-label`'s letter-spacing is meant for spaced-out column
          headings, not two tight initials — at `small` it left them almost
          touching the circle's edge, so it's neutralized here. */}
      <span className="tracking-normal" aria-hidden={label ? true : undefined}>
        {children}
      </span>
    </span>
  );
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum number of avatars shown before collapsing the rest into a "+N" indicator. Defaults to 3. */
  max?: number;
}

export function AvatarGroup({ max = 3, className, children, ...props }: AvatarGroupProps) {
  const items = Children.toArray(children);
  const visibleCount = items.length > max ? Math.max(max - 1, 1) : items.length;
  const visible = items.slice(0, visibleCount);
  const remaining = items.length - visibleCount;

  return (
    <div className={cn("flex items-center", className)} {...props}>
      {visible.map((child, index) => (
        <div
          key={index}
          className={cn("rounded-pill bg-neutral-default p-0.5", index > 0 && "-ml-2.5")}
        >
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="-ml-2.5 rounded-pill bg-neutral-default p-0.5">
          <Avatar label={`${remaining} más`}>+{remaining}</Avatar>
        </div>
      )}
    </div>
  );
}
