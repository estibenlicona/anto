import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PersonDetailHeader } from "../PersonDetailHeader";
import { PersonDetailStatsCards } from "../PersonDetailStatsCards";
import { PersonAssignmentPanel } from "../PersonAssignmentPanel";
import { PersonUnassignedPanel } from "../PersonUnassignedPanel";
import { HoursBySprintPanel } from "../HoursBySprintPanel";
import { PersonStacksPanel } from "../PersonStacksPanel";
import { PersonProfilePanel } from "../PersonProfilePanel";
import { assigned, unassigned } from "./fixtures";

const wrap = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("PersonDetailHeader", () => {
  it("con célula: identidad completa, sin 'Sin célula', acción Reasignar", () => {
    const onReassign = vi.fn();
    wrap(
      <PersonDetailHeader
        detail={assigned}
        roleLabel="Colaborador"
        onEdit={vi.fn()}
        onReassign={onReassign}
        onDelete={vi.fn()}
        onAssess={vi.fn()}
        onCareerPlan={vi.fn()}
      />
    );
    expect(
      screen.getByRole("heading", { name: "María González" })
    ).toBeInTheDocument();
    expect(screen.getByText("Avanzado · SFIA 3")).toBeInTheDocument();
    expect(screen.getByText("Interna")).toBeInTheDocument();
    expect(screen.getByText("Híbrido")).toBeInTheDocument();
    expect(screen.getByText("maria.gonzalez@tuya.com")).toBeInTheDocument();
    expect(screen.getByText("DevOps vinculado")).toBeInTheDocument();
    expect(screen.queryByText("Sin célula")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reasignar" }));
    expect(onReassign).toHaveBeenCalled();
    expect(screen.getByRole("link", { name: /Personas/ })).toHaveAttribute(
      "href",
      "/app/lead/personas"
    );
  });

  it("ofrece evaluar habilidades sin competir con la acción primaria de la ficha", () => {
    const onAssess = vi.fn();
    wrap(
      <PersonDetailHeader
        detail={assigned}
        roleLabel="Colaborador"
        onEdit={vi.fn()}
        onReassign={vi.fn()}
        onDelete={vi.fn()}
        onAssess={onAssess}
        onCareerPlan={vi.fn()}
      />
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Evaluar habilidades/ })
    );
    expect(onAssess).toHaveBeenCalled();
  });

  it("ofrece el plan de carrera junto a evaluar, en ese orden", () => {
    const onCareerPlan = vi.fn();
    wrap(
      <PersonDetailHeader
        detail={assigned}
        roleLabel="Colaborador"
        onEdit={vi.fn()}
        onReassign={vi.fn()}
        onDelete={vi.fn()}
        onAssess={vi.fn()}
        onCareerPlan={onCareerPlan}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Competencias/ }));
    expect(onCareerPlan).toHaveBeenCalled();
  });

  it("sin célula: externa con proveedor, 'Sin célula', sin identidad, acción Asignar", () => {
    wrap(
      <PersonDetailHeader
        detail={unassigned}
        roleLabel="Colaborador"
        onEdit={vi.fn()}
        onReassign={vi.fn()}
        onDelete={vi.fn()}
        onAssess={vi.fn()}
        onCareerPlan={vi.fn()}
      />
    );
    expect(screen.getByText("Externa · Globant")).toBeInTheDocument();
    expect(screen.getByText("Sin célula")).toBeInTheDocument();
    expect(screen.getByText("Sin identidad DevOps")).toBeInTheDocument();
    // El cargo y el rol dicen cosas distintas: "Product Owner" es a qué se
    // dedica; "Colaborador", cómo participa en la aplicación.
    expect(screen.getByText("Product Owner · Colaborador")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Asignar a una célula" })
    ).toBeInTheDocument();
  });
});

describe("PersonDetailStatsCards", () => {
  it("las cards van separadas con la medida del detalle", () => {
    const { container } = wrap(
      <PersonDetailStatsCards
        detail={assigned}
        onValidateHours={vi.fn()}
        onLinkIdentity={vi.fn()}
        validating={false}
      />
    );
    // gap-3 como los bloques y las columnas del detalle; antes gap-4.
    const grid = container.querySelector(".grid")!;
    expect(grid).toHaveClass("gap-3");
    expect(grid).not.toHaveClass("gap-4");
  });

  it("con reporte por validar muestra Validar; real y delta", () => {
    const onValidate = vi.fn();
    wrap(
      <PersonDetailStatsCards
        detail={assigned}
        onValidateHours={onValidate}
        onLinkIdentity={vi.fn()}
        validating={false}
      />
    );
    expect(screen.getByText("0.90 FTE")).toBeInTheDocument();
    expect(screen.getByText("+10 pts sobre lo asignado")).toBeInTheDocument();
    expect(screen.getByText("Por validar")).toBeInTheDocument();
    // 42 BAU + 32 Iniciativa + 6 libres del fixture
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("dentro de 76–84 h")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Validar" }));
    expect(onValidate).toHaveBeenCalled();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(
      screen.getByText("pendientes de curación", { exact: false })
    ).toBeInTheDocument();
  });

  it("validado: sin botón Validar", () => {
    wrap(
      <PersonDetailStatsCards
        detail={{
          ...assigned,
          currentReport: { ...assigned.currentReport!, status: "Validated" },
        }}
        onValidateHours={vi.fn()}
        onLinkIdentity={vi.fn()}
        validating={false}
      />
    );
    expect(screen.getByText("Validado")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Validar" })
    ).not.toBeInTheDocument();
  });

  it("sin célula: 'No aplica', sin sprints, y DevOps sin vincular con acción", () => {
    const onLink = vi.fn();
    wrap(
      <PersonDetailStatsCards
        detail={unassigned}
        onValidateHours={vi.fn()}
        onLinkIdentity={onLink}
        validating={false}
      />
    );
    expect(screen.getByText("No aplica")).toBeInTheDocument();
    expect(screen.getByText("Sin célula no reporta")).toBeInTheDocument();
    expect(screen.getByText("Sin sprints reportados")).toBeInTheDocument();
    expect(screen.getByText("Sus items no cuentan")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Vincular identidad" }));
    expect(onLink).toHaveBeenCalled();
  });
});

describe("PersonAssignmentPanel", () => {
  it("célula, dedicación, señales y acciones con su modo", () => {
    const onRaise = vi.fn();
    const onMove = vi.fn();
    const onRemove = vi.fn();
    wrap(
      <PersonAssignmentPanel
        detail={assigned}
        onRaise={onRaise}
        onMove={onMove}
        onRemove={onRemove}
      />
    );
    expect(
      screen.getByRole("link", { name: "Backend Platform" })
    ).toHaveAttribute("href", "/app/lead/celulas/s1");
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(
      screen.getByText(/con Carlos y Andrés · desde el 12 mar 2024/)
    ).toBeInTheDocument();
    expect(screen.getByText("20% libre · 0.2 FTE")).toBeInTheDocument();
    expect(screen.getByText("SFIA 3 acorde al requerido")).toBeInTheDocument();
    expect(screen.getByText("Reporta más de lo asignado")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Subir dedicación" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Mover a otra célula" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Quitar de la célula" })
    );
    expect(onRaise).toHaveBeenCalled();
    expect(onMove).toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalled();
  });

  it("SFIA insuficiente en advertencia", () => {
    wrap(
      <PersonAssignmentPanel
        detail={{
          ...assigned,
          allocation: {
            ...assigned.allocation!,
            requiredSfia: 4,
            sfiaGap: "Insufficient",
          },
        }}
        onRaise={vi.fn()}
        onMove={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(
      screen.getByText("SFIA 3 por debajo del requerido")
    ).toBeInTheDocument();
  });
});

describe("PersonUnassignedPanel", () => {
  it("estado vacío y 'Asignar acá' con el id de la célula", () => {
    const onAssignTo = vi.fn();
    wrap(<PersonUnassignedPanel detail={unassigned} onAssignTo={onAssignTo} />);
    expect(
      screen.getByText("Camila no está en ninguna célula")
    ).toBeInTheDocument();
    expect(
      screen.getByText("DÓNDE HACE FALTA PRODUCT OWNER")
    ).toBeInTheDocument();
    expect(screen.getByText("Sin equipo · pide SFIA 3")).toBeInTheDocument();
    // Cada célula sugerida es una fila de panel: py-3, como la cabecera del
    // panel y las filas del perfil; antes py-2.5.
    const row = screen.getAllByRole("listitem")[0];
    expect(row).toHaveClass("py-3");
    expect(row).not.toHaveClass("py-2.5");
    fireEvent.click(screen.getByRole("button", { name: "Asignar acá" }));
    expect(onAssignTo).toHaveBeenCalledWith("pagos");
  });
});

describe("HoursBySprintPanel", () => {
  it("con datos: una barra por sprint, el no validado marcado, y la línea de lo asignado", () => {
    render(<HoursBySprintPanel detail={assigned} />);
    expect(
      screen.getByRole("img", { name: /S14 70 h, S15 72 h, S16 74 h/ })
    ).toBeInTheDocument();
    expect(screen.getByText(/74 h · por validar/)).toBeInTheDocument();
    expect(screen.getByText("Asignado 80 %")).toBeInTheDocument();
    expect(
      screen.getByText(/corresponden 64 h: los 2 últimos sprints/)
    ).toBeInTheDocument();
  });

  it("vacío sin sprints", () => {
    render(<HoursBySprintPanel detail={unassigned} />);
    expect(
      screen.getByText("Todavía no hay sprints reportados")
    ).toBeInTheDocument();
  });
});

describe("PersonStacksPanel", () => {
  it("marca principal y bus factor 1 sólo donde corresponde; Editar abre el drawer", () => {
    const onEdit = vi.fn();
    render(<PersonStacksPanel detail={assigned} onEdit={onEdit} />);
    const items = screen.getAllByRole("listitem");
    // Cada stack es una fila de panel: py-3, como la cabecera del panel y
    // las filas del perfil; antes py-2.5.
    expect(items[0]).toHaveClass("py-3");
    expect(items[0]).not.toHaveClass("py-2.5");
    expect(within(items[0]).getByText("Principal")).toBeInTheDocument();
    expect(
      within(items[0]).queryByText("Bus factor 1")
    ).not.toBeInTheDocument();
    expect(
      within(items[0]).getByText("6 personas más lo cubren")
    ).toBeInTheDocument();
    expect(within(items[0]).getByText("Avanzado")).toBeInTheDocument();
    expect(within(items[1]).getByText("Bus factor 1")).toBeInTheDocument();
    expect(
      within(items[1]).getByText("Nadie más en el chapter lo cubre")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Editar" }));
    expect(onEdit).toHaveBeenCalled();
  });

  it("sin stacks muestra el estado vacío con la acción de agregar", () => {
    const onEdit = vi.fn();
    render(
      <PersonStacksPanel detail={{ ...assigned, stacks: [] }} onEdit={onEdit} />
    );
    expect(screen.getByText("Sin stacks registrados")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Agregar stacks" }));
    expect(onEdit).toHaveBeenCalled();
  });
});

describe("PersonProfilePanel", () => {
  it("interna: sin proveedor; nada del encabezado repetido", () => {
    render(<PersonProfilePanel detail={assigned} onEdit={vi.fn()} />);
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("15 may 2023")).toBeInTheDocument();
    expect(screen.getByText("en rango para Avanzado")).toBeInTheDocument();
    expect(screen.getByText("mgonzalez@tuya")).toBeInTheDocument();
    expect(screen.queryByText("Proveedor")).not.toBeInTheDocument();
    expect(
      screen.queryByText("maria.gonzalez@tuya.com")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Híbrido")).not.toBeInTheDocument();
    expect(screen.queryByText("Avanzado")).not.toBeInTheDocument();
  });

  it("externa: proveedor con vigencia, costo alto, identidad sin vincular", () => {
    render(<PersonProfilePanel detail={unassigned} onEdit={vi.fn()} />);
    expect(screen.getByText("Proveedor")).toBeInTheDocument();
    expect(screen.getByText("Globant")).toBeInTheDocument();
    expect(screen.getByText(/contrato hasta 31 dic 2026/)).toBeInTheDocument();
    expect(screen.getByText("alto para Experto")).toBeInTheDocument();
    expect(screen.getByText("Sin vincular")).toBeInTheDocument();
  });

  it("con línea y lead: nombra a los dos", () => {
    wrap(
      <PersonProfilePanel
        detail={{ ...assigned, expertiseLineLeadName: "Esteban Licona" }}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText("Línea de expertise")).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("· Lead: Esteban Licona")).toBeInTheDocument();
  });

  it("el chapter nombra a quien tiene a cargo a la persona, aparte de la línea", () => {
    wrap(<PersonProfilePanel detail={assigned} onEdit={vi.fn()} />);
    // Las dos filas conviven y nombran a responsables distintos: el del
    // chapter es el que la ve en su listado; el de la línea, no.
    expect(screen.getByText("Chapter")).toBeInTheDocument();
    expect(screen.getByText("Core y Datos")).toBeInTheDocument();
    expect(screen.getByText("· Lead: Tomás Giraldo")).toBeInTheDocument();
    expect(screen.getByText("Línea de expertise")).toBeInTheDocument();
    expect(screen.getByText("· Lead: Esteban Licona")).toBeInTheDocument();
  });

  it("la persona lidera su chapter: no se anuncia como si el lead fuera otro", () => {
    wrap(
      <PersonProfilePanel
        detail={{ ...assigned, chapterLeadName: assigned.person.name }}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText("· Lidera este chapter")).toBeInTheDocument();
  });

  it("sin chapter: lo dice en vez de dejar la fila muda", () => {
    wrap(
      <PersonProfilePanel
        detail={{ ...assigned, chapterName: null, chapterLeadName: null }}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText("Sin chapter asignado")).toBeInTheDocument();
  });

  it("sin línea: lo dice y enlaza a la pantalla de Líneas", () => {
    wrap(
      <PersonProfilePanel
        detail={{
          ...assigned,
          expertiseLineName: null,
          expertiseLineLeadName: null,
        }}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText("Sin línea asignada")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Asignar una línea" })
    ).toHaveAttribute("href", "/app/admin/lineas");
    // Sin línea no hay lead de línea que nombrar. Se nombra al de la línea y
    // no a cualquiera que diga "Lead:", porque la fila del chapter sigue
    // nombrando —con razón— a quien tiene a cargo a la persona.
    expect(
      screen.queryByText("· Lead: Esteban Licona")
    ).not.toBeInTheDocument();
    expect(screen.getByText("· Lead: Tomás Giraldo")).toBeInTheDocument();
  });

  it("línea sin lead: muestra la línea y dice que falta", () => {
    wrap(
      <PersonProfilePanel
        detail={{ ...assigned, expertiseLineLeadName: null }}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("· Sin lead")).toBeInTheDocument();
  });

  it("la persona lidera su propia línea: no se anuncia como si el lead fuera otro", () => {
    wrap(
      <PersonProfilePanel
        detail={{ ...assigned, expertiseLineLeadName: assigned.person.name }}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText("· Lidera esta línea")).toBeInTheDocument();
    expect(
      screen.queryByText(`· Lead: ${assigned.person.name}`)
    ).not.toBeInTheDocument();
  });
});
