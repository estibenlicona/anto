import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Table, TableBody } from "@tuya-ui/components";
import { TableStatusRow } from "../TableStatusRow";

describe("TableStatusRow", () => {
  it("renders a single cell spanning the given columns with the content", () => {
    render(
      <Table>
        <TableBody>
          <TableStatusRow colSpan={5}>Cargando…</TableStatusRow>
        </TableBody>
      </Table>
    );
    const cells = screen.getAllByRole("cell");
    expect(cells).toHaveLength(1);
    expect(cells[0]).toHaveAttribute("colspan", "5");
    expect(cells[0]).toHaveTextContent("Cargando…");
  });
});
