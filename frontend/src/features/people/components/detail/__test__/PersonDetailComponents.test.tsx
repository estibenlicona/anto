import { describe, expect, it, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PersonDetailHeader } from "../PersonDetailHeader";
import { PersonPointerCards } from "../PersonPointerCards";
import { PersonSkillProfilePanel } from "../PersonSkillProfilePanel";
import { PersonPlanPanel } from "../PersonPlanPanel";
import { PersonStacksPanel } from "../PersonStacksPanel";
import { PersonProfilePanel } from "../PersonProfilePanel";
import { toPersonPlanView } from "@features/career-plan/adapters/PersonPlanAdapter";
import type { PersonPlanDto } from "@features/career-plan/services/careerPlanService";
import { assigned, unassigned } from "./fixtures";

const inRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

const PLAN_HREF = "/capacidad/competencias/p1";

const planDto: PersonPlanDto = {
  personId: "p1",
  personName: "María González",
  position: "Backend Dev",
  assessmentClosedAtUtc: "2026-08-12T10:00:00Z",
  cycle: "2026-H2",
  skills: [
    {
      skillId: "sk1",
      skillName: "Diseño de soluciones",
      group: "technical",
      level: 3,
      expectedLevel: 4,
      gap: 1,
      metCriteria: ["Diseña componentes"],
      levelTotal: 4,
      missingCriteria: ["Lidera diseños de dominio"],
      expectedTotal: 5,
      note: "",
    },
    {
      skillId: "sk2",
      skillName: "Comunicación",
      group: "human",
      level: 3,
      expectedLevel: 3,
      gap: 0,
      metCriteria: [],
      levelTotal: 3,
      missingCriteria: [],
      expectedTotal: 3,
      note: "",
    },
  ],
  actions: [
    {
      id: "ac1",
      personId: "p1",
      skillId: "sk1",
      skillName: "Diseño de soluciones",
      fromLevel: 3,
      targetLevel: 4,
      dueMonth: "2026-11",
      title: "Liderar el diseño del dominio de pagos",
      status: "InProgress",
    },
    {
      id: "ac2",
      personId: "p1",
      skillId: "sk1",
      skillName: "Diseño de soluciones",
      fromLevel: 3,
      targetLevel: 4,
      dueMonth: "2026-06",
      title: "Certificación Azure Solutions Architect",
      status: "Done",
    },
  ],
};
const plan = toPersonPlanView(planDto);

describe("PersonDetailHeader", () => {
  it("encabezado mínimo: nombre, cargo y stack principal; sin identidad ni asignación", () => {
    inRouter(
      <PersonDetailHeader
        detail={assigned}
        onEdit={vi.fn()}
        onCareerPlan={vi.fn()}
      />
    );
    expect(
      screen.getByRole("heading", { name: "María González" })
    ).toBeInTheDocument();
    expect(screen.getByText("Backend Dev")).toBeInTheDocument();
    expect(screen.getByText(".NET")).toBeInTheDocument();
    // Nada de la identidad que ahora vive en el Perfil, ni de asignación.
    expect(
      screen.queryByText("maria.gonzalez@tuya.com")
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Híbrido/)).not.toBeInTheDocument();
    expect(screen.queryByText(/DevOps/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Avanzado/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Reasignar|Asignar/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Eliminar|Más acciones/ })
    ).not.toBeInTheDocument();
  });

  it("dos acciones: Competencias (sutil) y Editar (primaria)", () => {
    const onEdit = vi.fn();
    const onCareerPlan = vi.fn();
    inRouter(
      <PersonDetailHeader
        detail={unassigned}
        onEdit={onEdit}
        onCareerPlan={onCareerPlan}
      />
    );
    // Sin célula el encabezado es idéntico: la página no habla de asignación.
    expect(screen.queryByText(/Sin célula/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Competencias/ }));
    expect(onCareerPlan).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Editar/ }));
    expect(onEdit).toHaveBeenCalled();
  });
});

describe("PersonPointerCards", () => {
  it("con señal: badge de la señal y el conteo, con Ver hacia el dashboard; sin SP ni horas", () => {
    inRouter(
      <PersonPointerCards
        detail={assigned}
        plan={plan}
        planHref={PLAN_HREF}
        onLinkIdentity={vi.fn()}
      />
    );
    expect(screen.getByText("Posible sobreasignación")).toBeInTheDocument();
    expect(
      screen.getByText("2 de 6 señales · S18 · en curso")
    ).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: "Ver" });
    expect(
      links.some((l) => l.getAttribute("href") === "/capacidad/dedicacion/p1")
    ).toBe(true);
    // El resumen no trae cifras del sprint: eso vive en Capacidad.
    expect(screen.queryByText(/SP/)).not.toBeInTheDocument();
    expect(screen.queryByText(/FTE/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bh\b/)).not.toBeInTheDocument();
  });

  it("competencias: brechas abiertas con la fecha de evaluación y Ver hacia el plan", () => {
    inRouter(
      <PersonPointerCards
        detail={assigned}
        plan={plan}
        planHref={PLAN_HREF}
        onLinkIdentity={vi.fn()}
      />
    );
    expect(screen.getByText("1 brecha abierta")).toBeInTheDocument();
    expect(
      screen.getByText(/evaluado el 12 de agosto de 2026/)
    ).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: "Ver" });
    expect(links.some((l) => l.getAttribute("href") === PLAN_HREF)).toBe(true);
  });

  it("sin identidad: Sin vincular en peligro, sus items no cuentan y la acción de vincular", () => {
    const onLink = vi.fn();
    inRouter(
      <PersonPointerCards
        detail={unassigned}
        plan={null}
        planHref={PLAN_HREF}
        onLinkIdentity={onLink}
      />
    );
    expect(screen.getByText("Sin vincular")).toBeInTheDocument();
    expect(screen.getByText("Sus items no cuentan")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Vincular con Azure DevOps/ })
    );
    expect(onLink).toHaveBeenCalled();
    // Sin plan, el puntero de competencias degrada a su estado vacío.
    expect(screen.getByText("Sin evaluación")).toBeInTheDocument();
  });

  it("con identidad pero sin sprint dice Sin sprint en curso", () => {
    inRouter(
      <PersonPointerCards
        detail={{
          ...assigned,
          sprintPointer: { kind: "noSprint", balance: null, meta: null },
        }}
        plan={plan}
        planHref={PLAN_HREF}
        onLinkIdentity={vi.fn()}
      />
    );
    expect(screen.getByText("Sin sprint en curso")).toBeInTheDocument();
  });
});

describe("PersonSkillProfilePanel", () => {
  it("cada habilidad con su nivel, lo que pide el cargo y el badge Brecha/Cumple", () => {
    inRouter(<PersonSkillProfilePanel plan={plan} planHref={PLAN_HREF} />);
    expect(screen.getByText("Diseño de soluciones")).toBeInTheDocument();
    expect(
      screen.getByText("Avanzado · su cargo pide Experto")
    ).toBeInTheDocument();
    expect(screen.getByText("Brecha")).toBeInTheDocument();
    expect(screen.getByText("Cumple")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver evaluación" })
    ).toHaveAttribute("href", PLAN_HREF);
  });

  it("trunca a cinco habilidades con 'Ver más', igual que Stacks", () => {
    const bigPlan = toPersonPlanView({
      ...planDto,
      skills: Array.from({ length: 8 }, (_, i) => ({
        ...planDto.skills[1],
        skillId: `sk${i + 10}`,
        skillName: `Habilidad ${i + 1}`,
      })),
    });
    inRouter(<PersonSkillProfilePanel plan={bigPlan} planHref={PLAN_HREF} />);
    expect(screen.getByText("Habilidad 5")).toBeInTheDocument();
    expect(screen.queryByText("Habilidad 6")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ver 3 más" }));
    expect(screen.getByText("Habilidad 8")).toBeInTheDocument();
  });

  it("sin plan degrada al estado vacío sin romper", () => {
    inRouter(<PersonSkillProfilePanel plan={null} planHref={PLAN_HREF} />);
    expect(screen.getByText("Sin evaluación")).toBeInTheDocument();
  });
});

describe("PersonPlanPanel", () => {
  it("acciones con su brecha, objetivo, compromiso y estado; Agregar acción navega", () => {
    inRouter(<PersonPlanPanel plan={plan} planHref={PLAN_HREF} />);
    expect(
      screen.getByText("Liderar el diseño del dominio de pagos")
    ).toBeInTheDocument();
    expect(screen.getByText("En curso")).toBeInTheDocument();
    expect(screen.getByText("Cumplida")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Agregar acción" })
    ).toHaveAttribute("href", PLAN_HREF);
    // La regla del módulo acompaña la lista.
    expect(
      screen.getByText(/Cerrar una brecha no es marcar la acción/)
    ).toBeInTheDocument();
  });

  it("sin acciones muestra el estado vacío que apunta a Competencias", () => {
    inRouter(<PersonPlanPanel plan={null} planHref={PLAN_HREF} />);
    expect(
      screen.getByText("Todavía no hay acciones acordadas")
    ).toBeInTheDocument();
  });
});

describe("PersonStacksPanel", () => {
  it("cada stack con su medidor y sin el nombre del nivel en texto; Editar abre el drawer", () => {
    const onEdit = vi.fn();
    inRouter(<PersonStacksPanel detail={assigned} onEdit={onEdit} />);
    expect(screen.getByText(".NET")).toBeInTheDocument();
    expect(screen.getByText("AS400")).toBeInTheDocument();
    // El nivel va en el label accesible del medidor, no como texto visible.
    expect(screen.queryByText("Avanzado")).not.toBeInTheDocument();
    expect(
      screen.getByRole("meter", { name: ".NET: Avanzado" })
    ).toBeInTheDocument();
    // Sin bus factor ni cobertura: eso se lee en el mapa del span.
    expect(screen.queryByText(/Bus factor/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Editar" }));
    expect(onEdit).toHaveBeenCalled();
  });

  it("muestra las primeras cinco y 'Ver más' revela el resto", () => {
    const many = {
      ...assigned,
      stacks: Array.from({ length: 7 }, (_, i) => ({
        name: `Stack ${i + 1}`,
        level: 2,
        isPrimary: i === 0,
        otherCoverers: 1,
        coverers: [],
        busFactorOne: false,
        levelLabel: "Competente",
      })),
    };
    inRouter(<PersonStacksPanel detail={many} onEdit={vi.fn()} />);
    expect(screen.getByText("Stack 5")).toBeInTheDocument();
    expect(screen.queryByText("Stack 6")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ver 2 más" }));
    expect(screen.getByText("Stack 7")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ver menos" })
    ).toBeInTheDocument();
  });

  it("sin stacks muestra el estado vacío con la acción de agregar", () => {
    const onEdit = vi.fn();
    inRouter(
      <PersonStacksPanel detail={{ ...assigned, stacks: [] }} onEdit={onEdit} />
    );
    expect(screen.getByText("Sin stacks registrados")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Agregar stacks" }));
    expect(onEdit).toHaveBeenCalled();
  });
});

describe("PersonProfilePanel", () => {
  it("interna: las nueve filas de la ficha, con el nivel en la escala de cuatro y sin número SFIA", () => {
    const { container } = inRouter(
      <PersonProfilePanel detail={assigned} onEdit={vi.fn()} />
    );
    const dl = container.querySelector("dl")!;
    for (const label of [
      "Nivel",
      "Modalidad",
      "Vinculación",
      "Correo",
      "Identidad DevOps",
      "Líder de expertise",
      "Línea de expertise",
      "Ingreso",
      "Costo mensual",
    ]) {
      expect(within(dl).getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("Avanzado")).toBeInTheDocument();
    expect(screen.queryByText(/SFIA/)).not.toBeInTheDocument();
    expect(screen.getByText("Híbrido")).toBeInTheDocument();
    expect(screen.getByText("Interna")).toBeInTheDocument();
    expect(screen.getByText("maria.gonzalez@tuya.com")).toBeInTheDocument();
    expect(screen.getByText("Vinculada")).toBeInTheDocument();
    // Chapter lleva a la persona (su Líder de Expertise), no a la unidad; la
    // línea dice a cuál pertenece, a secas.
    expect(screen.getByText("Tomás Giraldo")).toBeInTheDocument();
    expect(screen.queryByText("Core y Datos")).not.toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.queryByText(/Lead:/)).not.toBeInTheDocument();
    expect(screen.getByText("15 may 2023")).toBeInTheDocument();
    // La cifra sola, sin lectura de concordancia.
    expect(screen.getByText(/7\.900\.000/)).toBeInTheDocument();
    expect(screen.queryByText(/en rango/)).not.toBeInTheDocument();
  });

  it("externa sin identidad: proveedor en la vinculación y DevOps sin vincular en peligro", () => {
    inRouter(<PersonProfilePanel detail={unassigned} onEdit={vi.fn()} />);
    expect(screen.getByText("Externa · Globant")).toBeInTheDocument();
    expect(screen.getByText("Sin vincular")).toBeInTheDocument();
    expect(screen.getByText("Remoto")).toBeInTheDocument();
  });

  it("nada de asignación en la ficha", () => {
    inRouter(<PersonProfilePanel detail={assigned} onEdit={vi.fn()} />);
    expect(screen.queryByText(/Backend Platform/)).not.toBeInTheDocument();
    expect(screen.queryByText(/dedicación/)).not.toBeInTheDocument();
    expect(screen.queryByText(/BAU/)).not.toBeInTheDocument();
  });
});
