import {
  Children,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  createContext,
  isValidElement,
  useContext,
  useId,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import type { IconName } from "@/icons/paths";
import { Kbd } from "./kbd";

interface OptionCardContextValue {
  name: string;
  value: string | undefined;
  select: (value: string) => void;
  /** The value that currently holds the roving tab stop. */
  focusable: string | undefined;
  disabled: boolean;
  moveFocus: (from: string, delta: 1 | -1) => void;
}

const OptionCardContext = createContext<OptionCardContextValue | null>(null);

export interface OptionCardGroupProps {
  /** Visible legend for the group, read as its accessible name. */
  label?: string;
  /** Name of the group, for consumers that mirror it into a form. Generated when omitted. */
  name?: string;
  /** Selected value. Pass together with `onValueChange` for a controlled group. */
  value?: string;
  /** Initial value for an uncontrolled group. */
  defaultValue?: string;
  /** Called with the new value when the user selects a card. */
  onValueChange?: (value: string) => void;
  /** Disables every card. A card can also disable itself. */
  disabled?: boolean;
  /** Equal columns side by side; omit to stack the cards. */
  columns?: 2 | 3 | 4;
  /** `OptionCard` children, in order. */
  children: ReactNode;
  className?: string;
}

const columnClasses: Record<NonNullable<OptionCardGroupProps["columns"]>, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

/**
 * A set of mutually exclusive options, each drawn as a card: a radio, a
 * title, a description and — only here, which is what RadioGroup cannot do —
 * content of its own, like a Select that matters only once the option is
 * chosen. Implemented as an ARIA radiogroup with a roving tab stop rather
 * than native radios: a `<label>` cannot wrap another control, so a card with
 * a Select inside has to own its keyboard handling. Arrows move focus and
 * selection together and skip disabled cards; Tab leaves the group — or
 * enters the chosen card's content, which sits outside the radio node.
 */
export function OptionCardGroup({
  label,
  name,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  columns,
  children,
  className,
}: OptionCardGroupProps) {
  const generatedName = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value !== undefined ? value : internal;
  const [focusable, setFocusable] = useState<string | undefined>(undefined);

  const select = (next: string) => {
    if (value === undefined) setInternal(next);
    setFocusable(next);
    onValueChange?.(next);
  };

  const childValues = Children.toArray(children)
    .filter((c): c is ReactElement<OptionCardProps> => isValidElement(c))
    .map((c) => c.props);

  const moveFocus = (from: string, delta: 1 | -1) => {
    // El orden se lee de los hijos declarados y no de un registro que cada
    // tarjeta rellenaba durante su render: ese registro se vaciaba al empezar
    // cada render del grupo, así que en cuanto el consumidor re-renderizaba
    // por su cuenta —un grupo controlado, sin ir más lejos— las flechas se
    // encontraban la lista vacía y no movían nada.
    const enabled = childValues.filter((c) => !c.disabled && !disabled);
    if (enabled.length === 0) return;
    const index = enabled.findIndex((o) => o.value === from);
    const next = enabled[(index + delta + enabled.length) % enabled.length];
    select(next.value);
    document.getElementById(`${generatedName}-${next.value}`)?.focus();
  };

  const firstEnabled = childValues.find((c) => !c.disabled && !disabled)?.value;
  const tabStop =
    focusable ??
    (current !== undefined && childValues.some((c) => c.value === current) ? current : firstEnabled);

  return (
    <OptionCardContext.Provider
      value={{
        name: generatedName,
        value: current,
        select,
        focusable: tabStop,
        disabled,
        moveFocus,
      }}
    >
      <div
        role="radiogroup"
        aria-label={label}
        data-name={name ?? generatedName}
        className={cn(
          "grid gap-3",
          columns ? columnClasses[columns] : "grid-cols-1",
          className,
        )}
      >
        {children}
      </div>
    </OptionCardContext.Provider>
  );
}

export interface OptionCardProps {
  /** The value this card stands for. */
  value: string;
  /** Option title. */
  title: string;
  /**
   * Icon shown between the radio and the title. Decorative: the title already
   * names the option, so it is hidden from screen readers.
   */
  icon?: IconName;
  /** One line on what choosing it means. */
  description?: ReactNode;
  /** Keyboard shortcut shown next to the title. Informative only: the consumer listens for it. */
  shortcut?: string;
  /** Cannot be chosen; arrows skip it. */
  disabled?: boolean;
  /** Content that belongs to this option — reachable with Tab, and it never changes the selection. */
  children?: ReactNode;
  className?: string;
}

export function OptionCard({
  value,
  title,
  icon,
  description,
  shortcut,
  disabled: ownDisabled = false,
  children,
  className,
}: OptionCardProps) {
  const ctx = useContext(OptionCardContext);
  if (!ctx) throw new Error("OptionCard must be rendered inside OptionCardGroup");
  const disabled = ctx.disabled || ownDisabled;
  const selected = ctx.value === value;
  const id = `${ctx.name}-${value}`;
  const labelId = `${id}-label`;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        ctx.moveFocus(value, 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        ctx.moveFocus(value, -1);
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        ctx.select(value);
        break;
    }
  };

  return (
    <div
      className={cn(
        // El borde seleccionado es el doble de grueso; el padding se compensa
        // para que la tarjeta no cambie de tamaño al elegirse.
        "flex flex-col gap-2.5 rounded-surface bg-neutral-default",
        selected ? "border-bold border-neutral-bold p-[15px]" : "border-default border-neutral-default p-4",
        disabled && "bg-neutral-disabled",
        className,
      )}
    >
      <div
        id={id}
        role="radio"
        aria-checked={selected}
        aria-labelledby={labelId}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : ctx.focusable === value ? 0 : -1}
        onClick={() => !disabled && ctx.select(value)}
        onKeyDown={onKeyDown}
        className={cn(
          "-m-1 flex flex-col gap-1 rounded-control p-1 outline-none",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          "focus-visible:ring-focus focus-visible:ring-neutral-focus-ring",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              // El ancho del borde vive completo en cada rama: `cn` no
              // deduplica utilidades, y con `border-default` fijo en la base
              // el stylesheet decide quién gana — ahí `border-default` va
              // después de `border-[6px]` y el punto nunca se rellena.
              "h-[18px] w-[18px] shrink-0 rounded-pill bg-neutral-default",
              selected
                ? "border-[6px] border-neutral-bold"
                : "border-default border-neutral-bold",
              disabled && "border-neutral-disabled bg-neutral-disabled",
            )}
          />
          <span
            id={labelId}
            className={cn(
              "text-body-sm font-semibold",
              disabled ? "text-neutral-disabled" : "text-neutral-default",
            )}
          >
            {title}
          </span>
          {/* El icono se ancla al borde derecho y no junto al título: la
              columna de la izquierda es del radio, y con el icono pegado al
              texto las tarjetas de una fila dejaban de leerse alineadas. */}
          {icon && (
            <Icon
              name={icon}
              size={16}
              className={cn(
                "ml-auto shrink-0",
                disabled ? "text-neutral-disabled" : "text-neutral-subtle",
              )}
            />
          )}
          {shortcut && (
            <Kbd size="sm" className={icon ? undefined : "ml-auto"}>
              {shortcut}
            </Kbd>
          )}
        </div>
        {description && (
          <span
            className={cn(
              "pl-7 text-label font-normal tracking-normal",
              disabled ? "text-neutral-disabled" : "text-neutral-subtle",
            )}
          >
            {description}
          </span>
        )}
      </div>
      {children && (
        // Fuera del nodo `radio` y con sus teclas contenidas: operar el
        // control interno no mueve la selección del grupo.
        <div
          className="pl-7"
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}
