import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { radius } from "@tuya-ui/tokens";
import { Checkbox } from "./checkbox";
import { RadioGroup } from "./radio-group";

/**
 * La forma se comprueba en píxeles y no por el nombre de la clase.
 *
 * Es la trampa que dejó pasar el defecto original: `rounded-control` y
 * `rounded-pill` son nombres distintos, así que compararlos como texto dice
 * que los controles se distinguen. Pero `control` son 8 px y la caja mide 16:
 * la mitad del lado es la definición de un círculo, y los dos se dibujaban
 * igual. Lo que hay que comparar es el radio contra el tamaño.
 */
const LADO = 16;

/** La caja visible: el hermano decorativo del input, que es quien lleva la forma. */
function caja(etiqueta: string): HTMLElement {
  const input = screen.getByLabelText(etiqueta);
  return input.parentElement!.querySelector("span[aria-hidden]") as HTMLElement;
}

/** El radio en píxeles que resuelve la clase `rounded-*` de esa caja. */
function radioDe(elemento: HTMLElement): number {
  const clase = elemento.className
    .split(/\s+/)
    .find((c) => c.startsWith("rounded-"));
  if (!clase) throw new Error("la caja no declara redondeo");
  // La caja tiene que seguir midiendo lo que esta prueba asume: si cambia de
  // tamaño, el umbral del círculo cambia con ella.
  expect(elemento.parentElement!.className).toContain("h-4");
  const valor = radius[clase.replace("rounded-", "") as keyof typeof radius];
  return parseFloat(valor);
}

/** A partir de la mitad del lado, el redondeo deja de ser esquina y es círculo. */
const esCircular = (radioPx: number) => radioPx >= LADO / 2;

describe("Checkbox", () => {
  it("se dibuja cuadrado y no circular", () => {
    render(<Checkbox label="Incluir a esta persona" />);

    // No se afirma un valor concreto —cambiará con el próximo ajuste— sino que
    // el redondeo se lea como esquina al tamaño real del control.
    expect(esCircular(radioDe(caja("Incluir a esta persona")))).toBe(false);
  });

  it("conserva la forma en marcado, indeterminado y deshabilitado", () => {
    // Los tres estados comparten la misma caja: si alguno tomara otro radio,
    // la casilla cambiaría de forma al marcarla.
    render(
      <>
        <Checkbox label="Marcada" defaultChecked />
        <Checkbox label="Parcial" indeterminate />
        <Checkbox label="Bloqueada" disabled />
      </>,
    );

    const radios = ["Marcada", "Parcial", "Bloqueada"].map((l) =>
      radioDe(caja(l)),
    );
    expect(new Set(radios).size).toBe(1);
    expect(esCircular(radios[0])).toBe(false);
  });

  it("no se confunde con un radio cuando ninguno está marcado", () => {
    /*
      Es el caso que fallaba y el que ninguna prueba miraba: marcados se
      distinguen por el tilde contra el punto, y por eso el defecto sobrevivió.
      Sin marcar, lo único que queda es el contorno — y ahí los dos eran
      círculos.
    */
    render(
      <>
        <Checkbox label="Varias" />
        <RadioGroup
          options={[{ value: "una", label: "Una sola" }]}
          onValueChange={() => {}}
        />
      </>,
    );

    expect(esCircular(radioDe(caja("Varias")))).toBe(false);
    expect(esCircular(radioDe(caja("Una sola")))).toBe(true);
  });
});
