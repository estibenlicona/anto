import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // El canvas de página es bg-neutral-subtlest, un paso más oscuro que
        // esta superficie — así la card se distingue del fondo. Ver la nota
        // en tokens/src/semantic-colors.ts ("The card surface. The page
        // canvas is `subtlest`, one step down.").
        //
        // El trazo delimita y la sombra eleva: son funciones distintas y por eso
        // conviven. La sombra nunca define el borde superior —se proyecta hacia
        // abajo—, así que no puede delimitar; pero sí dice que la superficie
        // está por encima del lienzo, que es lo suyo.
        //
        // El trazo es el neutro estándar, el mismo que usan los demás
        // contenedores con borde del catálogo. Card llegó a usar el translúcido
        // `soft` buscando suavizarlo, pero entre ambos hay 1.03:1 —o sea nada— y
        // la diferencia sólo servía para dejar a Card como excepción.
        "rounded-surface border-default border-neutral-default bg-neutral-default shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

/**
 * El trazo interno es el mismo que el del contorno, para que la tarjeta se lea
 * como una sola pieza. Un salto de peso entre el borde y sus divisiones la
 * partía en secciones que compiten entre sí.
 */
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-b-default border-neutral-default px-4 py-3", className)} {...props} />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-3", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-t-default border-neutral-default px-4 py-3", className)} {...props} />
  );
}
