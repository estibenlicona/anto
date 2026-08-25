import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { componentSize } from "@tuya-ui/tokens";
import { SeniorityCard, seniorityLevels } from "./seniority-card";

/** La pieza es el elemento que lleva el nombre accesible del nivel. */
function renderCard(props: Parameters<typeof SeniorityCard>[0]) {
  const { container } = render(<SeniorityCard {...props} />);
  const card = container.firstElementChild as HTMLElement;
  if (!card) throw new Error("SeniorityCard no renderizó nada");
  return card;
}

describe("dimensión fija", () => {
  it("mide lo mismo en los cuatro niveles", () => {
    const widths = seniorityLevels.map((level) => {
      const card = renderCard({ level });
      return getComputedStyle(card).width;
    });

    expect(new Set(widths).size).toBe(1);
    expect(widths[0]).toBe(componentSize.seniorityCard.width);
  });

  it("no cambia de ancho con la longitud de la etiqueta", () => {
    // "Principiante" es la etiqueta más larga de la escala y "Experto" la más
    // corta: si el ancho siguiera al texto, se vería entre estas dos.
    const largest = getComputedStyle(renderCard({ level: "Principiante" })).width;
    const smallest = getComputedStyle(renderCard({ level: "Experto" })).width;

    expect(largest).toBe(smallest);
  });

  it("muestra la etiqueta más larga completa, sin recortarla en el markup", () => {
    renderCard({ level: "Principiante" });

    expect(screen.getByText("Principiante")).toBeInTheDocument();
  });

  it("toma el alto de su densidad, con la medida del token como medida final", () => {
    const comfortable = renderCard({ level: "Avanzado" });
    const compact = renderCard({ level: "Avanzado", density: "compact" });

    expect(getComputedStyle(comfortable).height).toBe(componentSize.seniorityCard.height);
    expect(getComputedStyle(compact).height).toBe(componentSize.seniorityCard.heightCompact);
    expect(getComputedStyle(comfortable).boxSizing).toBe("border-box");
    expect(getComputedStyle(compact).boxSizing).toBe("border-box");
  });

  it("conserva el ancho fijo también en el estado vacío", () => {
    const known = getComputedStyle(renderCard({ level: "Competente" })).width;
    const unknown = getComputedStyle(renderCard({ level: null })).width;

    expect(unknown).toBe(known);
  });

  it("usa su propio ancho reducido cuando oculta la etiqueta", () => {
    const narrow = renderCard({ level: "Experto", hideLabel: true });

    expect(getComputedStyle(narrow).width).toBe(componentSize.seniorityCard.widthNarrow);
  });
});

describe("sin superficie propia", () => {
  it.each(seniorityLevels)("no dibuja fondo, borde ni sombra en %s", (level) => {
    const card = renderCard({ level });

    // El bloque se apoya en lo que lo contenga. Cualquier utilidad de fondo,
    // borde o sombra acá sería la caja que el diseño retiró.
    expect(card.className).not.toMatch(/(^|\s)bg-/);
    expect(card.className).not.toMatch(/(^|\s)border(-|\s|$)/);
    expect(card.className).not.toMatch(/(^|\s)shadow/);
    expect(card.className).not.toMatch(/(^|\s)rounded/);
  });

  it("no compone Card: no aparecen sus clases de superficie", () => {
    const card = renderCard({ level: "Avanzado" });

    expect(card.className).not.toContain("rounded-surface");
    expect(card.className).not.toContain("shadow-sm");
  });
});

describe("la etiqueta no se tiñe", () => {
  it("usa el mismo color de texto neutro en los cuatro niveles", () => {
    const classNames = seniorityLevels.map((level) => {
      renderCard({ level });
      return screen.getByText(level).className;
    });

    for (const className of classNames) {
      expect(className).toContain("text-neutral-default");
      // El matiz vive sólo en el medidor: ninguna clase de acento en el texto.
      expect(className).not.toContain("accent");
    }
  });

  it("el estado vacío se lee más callado que un nivel real", () => {
    renderCard({ level: null });

    expect(screen.getByText("Sin nivel").className).toContain("text-neutral-subtle");
  });

  it("el matiz sí distingue a los medidores entre sí", () => {
    const tones = ["sky", "blue", "violet", "magenta"];

    seniorityLevels.forEach((level, index) => {
      const { container } = render(<SeniorityCard level={level} />);
      const filled = container.querySelector(`.bg-accent-${tones[index]}-fill`);
      expect(filled).not.toBeNull();
    });
  });
});

describe("escala cerrada", () => {
  it.each(seniorityLevels.map((level, index) => [level, index + 1] as const))(
    "%s llena %i de 4 segmentos",
    (level, filled) => {
      render(<SeniorityCard level={level} />);
      const meter = screen.getByRole("meter");

      expect(meter).toHaveAttribute("aria-valuenow", String(filled));
      expect(meter).toHaveAttribute("aria-valuemax", "4");
      expect(meter).toHaveAttribute("aria-valuetext", `${filled} de 4`);
    },
  );

  it("muestra el nombre del nivel, no su número", () => {
    render(<SeniorityCard level="Avanzado" />);

    expect(screen.getByText("Avanzado")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });

  it.each(["Senior", "5", "", "Junior"])(
    "renderiza el estado vacío documentado para %o, sin fallar en silencio",
    (level) => {
      renderCard({ level });

      expect(screen.getByText("Sin nivel")).toBeInTheDocument();
      // Sin medidor: no hay posición que anunciar, y un medidor en cero
      // afirmaría que la persona está en el primer paso de la escala.
      expect(screen.queryByRole("meter")).not.toBeInTheDocument();
    },
  );

  it("trata la ausencia de dato como estado vacío", () => {
    renderCard({ level: null });

    expect(screen.getByText("Sin nivel")).toBeInTheDocument();
  });

  it("nombra el nivel para tecnologías de asistencia aunque oculte la etiqueta", () => {
    const narrow = renderCard({ level: "Experto", hideLabel: true });

    expect(screen.queryByText("Experto")).not.toBeInTheDocument();
    expect(narrow).toHaveAttribute("aria-label", "Experto");
    // El tooltip nativo lleva lo mismo: el color nunca es el único canal.
    expect(narrow).toHaveAttribute("title", "Experto");
  });
});

describe("el rojo de marca queda fuera", () => {
  it.each(seniorityLevels)("no aparece en %s", (level) => {
    const card = renderCard({ level });

    expect(card.innerHTML + card.className).not.toMatch(/\bbrand\b/);
  });
});
