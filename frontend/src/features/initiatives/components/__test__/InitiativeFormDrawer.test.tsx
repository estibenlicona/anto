import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { InitiativeFormDrawer } from "../InitiativeFormDrawer";
import type { Initiative } from "../../adapters/InitiativeAdapter";

const SUBTITULO = /Qué es la iniciativa y quién la solicita/;

const iniciativa = {
  id: "ini-1",
  name: "Kafka Migration",
  squadId: "s1",
  squadName: "Backend Platform",
  productOwner: "Camila Restrepo",
  status: "Evaluating",
  statusLabel: "En evaluación",
  statusVariant: "info",
  talla: null,
  expectedFte: null,
  targetDate: "2026-12-31",
} as unknown as Initiative;

function abrir(props: { initiative?: Initiative }) {
  return render(
    <InitiativeFormDrawer
      open
      onOpenChange={vi.fn()}
      squadOptions={[{ value: "s1", label: "Backend Platform" }]}
      saving={false}
      serverError={null}
      onSubmit={vi.fn()}
      {...props}
    />
  );
}

describe("el drawer de iniciativa", () => {
  it("dice lo mismo al crear y al editar, de una sola manera", () => {
    // El formulario captura lo mismo en los dos casos. Decirlo de dos maneras
    // se lee como si significaran cosas distintas, que es exactamente lo que
    // el requisito de registro consistente pide evitar.
    abrir({});
    expect(screen.getByText(SUBTITULO)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Nueva iniciativa" })
    ).toBeInTheDocument();
    cleanup();

    abrir({ initiative: iniciativa });
    expect(screen.getByText(SUBTITULO)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Editar iniciativa" })
    ).toBeInTheDocument();
  });
});
