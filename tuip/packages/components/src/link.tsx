import { AnchorHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

export type LinkTone = "brand" | "neutral";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Color del enlace.
   *
   * `brand` es el enlace que quiere destacarse: el color lo distingue del texto
   * que lo rodea ya en reposo.
   *
   * `neutral` toma el color de texto de la superficie. Sirve para el enlace que
   * se repite —el nombre de cada fila de una tabla, por ejemplo—, donde el color
   * de marca deja de señalar y pasa a teñir la columna entera.
   *
   * **En reposo, un enlace `neutral` no se distingue del texto plano**: se revela
   * al pasar el puntero y al recibir el foco, y en un dispositivo táctil no hay
   * puntero que pasar. Elegilo a sabiendas de eso, no por descarte. Lo que no se
   * pierde es la vía asistida: sigue siendo un ancla, y un lector de pantalla lo
   * anuncia como enlace igual.
   */
  tone?: LinkTone;
  /**
   * Cede la etiqueta al hijo en vez de renderizar un `<a>` propio: el hijo
   * recibe las clases y las props de Link. Es la forma de aplicar el estilo del
   * sistema sobre el componente de enlace de un router, sin que Link tenga que
   * conocerlo ni anidar dos anclas.
   *
   * El hijo tiene que ser **un único elemento** que reenvíe props y `ref`.
   */
  asChild?: boolean;
}

// Color de texto y anillo de foco viajan juntos en cada entrada: un anillo de
// marca alrededor de un enlace deliberadamente neutro reintroduce el color que
// el consumidor pidió quitar. Escrito literal por tono, mismo motivo que
// `colorClasses` en avatar.tsx: el JIT de Tailwind necesita el nombre completo
// de la clase en el código, así que un `text-${tone}-default` armado en runtime
// no emitiría ningún CSS.
const toneClasses: Record<LinkTone, string> = {
  brand: "text-brand-default focus-visible:ring-brand-focus-ring",
  neutral: "text-neutral-default focus-visible:ring-neutral-focus-ring",
};

// El subrayado va sólo en hover y en foco, en los dos tonos. En `brand` es
// refuerzo de un color que ya distingue al enlace; en `neutral` es la única
// señal que tiene, y por eso también aparece al enfocar y no sólo al pasar el
// puntero: quien navega con teclado no tiene hover.
const baseClasses = cn(
  "rounded-control outline-none",
  "hover:underline focus-visible:underline underline-offset-2",
  "focus-visible:ring-focus",
);

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ tone = "brand", asChild = false, className, children, ...props }, ref) => {
    const Component = asChild ? Slot : "a";

    return (
      <Component
        ref={ref}
        className={cn(baseClasses, toneClasses[tone], className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Link.displayName = "Link";
