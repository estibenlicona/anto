import { describe, it, expect, beforeEach } from "vitest";
import { personService } from "@features/people/services/personService";
import { careerPlanService } from "@features/career-plan/services/careerPlanService";
import { skillsService } from "@features/skills/services/skillsService";
import { getPeopleSnapshot, resetPeopleMock } from "../people.handlers";
import { resetExpertiseLinesMock } from "../expertise-lines.handlers";

/**
 * El rol dejó de ser el cargo.
 *
 * Las dos mitades del cambio se prueban juntas porque una sostiene a la otra:
 * el rol puede cerrarse en un catálogo **porque** el nivel que se le exige a
 * alguien pasó a leerse de su cargo. Sin eso, cerrar el rol vacía Competencias
 * sin que nada falle.
 */

const CARLOS = "p3333333-3333-3333-3333-333333333333";

describe("el catálogo de roles", () => {
  beforeEach(() => resetPeopleMock());

  it("ofrece los cinco roles, en español", async () => {
    const roles = await personService.getRoles();
    expect(roles.map((r) => r.label)).toEqual([
      "Administrador",
      "Líder Técnico",
      "Líder de Expertise",
      "Product Owner",
      "Colaborador",
    ]);
    // En el contrato van en inglés: lo que se lee y lo que se programa son dos
    // vocabularios, y el mapa vive en un solo lugar.
    expect(roles.map((r) => r.value)).toEqual([
      "Administrator",
      "TechnicalLead",
      "ExpertiseLead",
      "ProductOwner",
      "Contributor",
    ]);
  });

  it("rechaza un rol que no está en el catálogo", async () => {
    await expect(
      personService.create({
        name: "Nueva Persona",
        documentId: "999",
        entraObjectId: "",
        userPrincipalName: "nueva@tuya.com",
        position: "Backend Dev",
        // Lo que el campo tenía antes: el cargo copiado.
        role: "Backend Dev" as never,
        technicalLeadId: null,
        seniority: 2,
        modality: "Remote",
        availableFte: 1,
        monthlyCost: 5000000,
        startDate: "2026-01-01",
      })
    ).rejects.toThrow();
  });

  it("no le pone a nadie el cargo como rol, que es la recaída a detectar", () => {
    const copiados = getPeopleSnapshot().filter((p) => p.role === p.position);
    expect(copiados.map((p) => p.name)).toEqual([]);
  });

  it("siembra más de un Líder Técnico y gente sin líder asignado", async () => {
    const leads = await personService.getTechnicalLeads();
    // Con uno solo el selector "funciona" y no prueba nada.
    expect(leads.length).toBeGreaterThanOrEqual(2);
    for (const lead of leads) {
      const persona = getPeopleSnapshot().find((p) => p.id === lead.id);
      expect(persona?.role).toBe("TechnicalLead");
    }
    // Y el campo es opcional: alguien tiene que estar sin líder técnico para
    // que ese caso exista en pantalla.
    expect(getPeopleSnapshot().some((p) => p.technicalLeadId === null)).toBe(
      true
    );
  });

  it("dice de cuántas personas es líder técnico cada quien", async () => {
    const { items } = await personService.list(1, 1000);
    const carlos = items.find((p) => p.id === CARLOS)!;
    const suyas = items.filter((p) => p.technicalLeadId === CARLOS);
    // Derivado y no sembrado: es lo que la edición necesita para poder avisar
    // a cuántas personas afecta quitarle el rol.
    expect(carlos.technicalLeadOfCount).toBe(suyas.length);
    expect(carlos.technicalLeadOfCount).toBeGreaterThan(0);
  });
});

describe("el nivel esperado se lee del cargo", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetExpertiseLinesMock();
  });

  it("declara las exigencias del catálogo por cargo y no por rol", async () => {
    const catalogo = await skillsService.get();
    const cargos = new Set(getPeopleSnapshot().map((p) => p.position));
    const roles = new Set(getPeopleSnapshot().map((p) => p.role));

    expect(catalogo.positions.length).toBeGreaterThan(0);
    for (const position of catalogo.positions)
      expect(cargos.has(position)).toBe(true);
    // Y ninguna exigencia se declara contra un rol: con cinco valores de
    // participación no se puede responder por todas las disciplinas.
    for (const skill of catalogo.skills) {
      for (const e of skill.expectations) {
        expect(cargos.has(e.position)).toBe(true);
        expect(roles.has(e.position as never)).toBe(false);
      }
    }
  });

  it("le sigue exigiendo a cada persona lo que su cargo pide", async () => {
    const span = await careerPlanService.getSpan();
    const carlos = span.people.find((p) => p.personId === CARLOS)!;
    // Carlos es Arquitecto y tiene evaluación cerrada: sus celdas comparan
    // contra lo que el catálogo le pide a ese cargo.
    expect(carlos.position).toBe("Arquitecto");
    expect(carlos.cells.some((c) => c.expectedLevel !== null)).toBe(true);
    expect(carlos.cells.some((c) => (c.gap ?? 0) > 0)).toBe(true);
  });

  it("no mueve ninguna brecha cuando una persona cambia de rol", async () => {
    const antes = await careerPlanService.getSpan();
    const brechasAntes = antes.people.map((p) => ({
      id: p.personId,
      brechas: p.cells.filter((c) => (c.gap ?? 0) > 0).length,
    }));

    const carlos = getPeopleSnapshot().find((p) => p.id === CARLOS)!;
    await personService.update(CARLOS, {
      name: carlos.name,
      documentId: carlos.documentId,
      entraObjectId: carlos.entraObjectId,
      userPrincipalName: carlos.userPrincipalName,
      position: carlos.position,
      // De Líder Técnico a Colaborador: cambia cómo participa, no a qué se
      // dedica.
      role: "Contributor",
      technicalLeadId: null,
      seniority: carlos.seniority,
      modality: carlos.modality,
      availableFte: carlos.availableFte,
      monthlyCost: carlos.monthlyCost,
      startDate: carlos.startDate,
    });

    const despues = await careerPlanService.getSpan();
    const brechasDespues = despues.people.map((p) => ({
      id: p.personId,
      brechas: p.cells.filter((c) => (c.gap ?? 0) > 0).length,
    }));
    expect(brechasDespues).toEqual(brechasAntes);
  });

  it("deja sin líder técnico a quienes lo tenían, cuando deja de serlo", async () => {
    const antes = (await personService.list(1, 1000)).items.filter(
      (p) => p.technicalLeadId === CARLOS
    );
    expect(antes.length).toBeGreaterThan(0);

    const carlos = getPeopleSnapshot().find((p) => p.id === CARLOS)!;
    await personService.update(CARLOS, {
      name: carlos.name,
      documentId: carlos.documentId,
      entraObjectId: carlos.entraObjectId,
      userPrincipalName: carlos.userPrincipalName,
      position: carlos.position,
      role: "Contributor",
      technicalLeadId: null,
      seniority: carlos.seniority,
      modality: carlos.modality,
      availableFte: carlos.availableFte,
      monthlyCost: carlos.monthlyCost,
      startDate: carlos.startDate,
    });

    // La referencia no queda apuntando a alguien que ya no es líder técnico.
    // Que el usuario se entere antes de guardar es trabajo del formulario; que
    // el dato no mienta, de acá.
    const despues = (await personService.list(1, 1000)).items.filter(
      (p) => p.technicalLeadId === CARLOS
    );
    expect(despues).toEqual([]);
  });
});

describe("la línea de expertise en el formulario", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetExpertiseLinesMock();
  });

  it("se puede leer para mostrarla, y sale del maestro de líneas", async () => {
    // Carlos está sembrado en Backend. Se lee del maestro y no de la persona:
    // por eso moverlo de línea se ve en su formulario sin tocarlo a él.
    await expect(personService.getExpertiseLine(CARLOS)).resolves.toMatchObject(
      { name: "Backend" }
    );
  });

  it("devuelve null para quien no tiene línea, sin inventarle una", async () => {
    const valentina = getPeopleSnapshot().find(
      (p) => p.name === "Valentina Ospina"
    )!;
    await expect(
      personService.getExpertiseLine(valentina.id)
    ).resolves.toBeNull();
  });

  it("no cambia con guardar la persona: el formulario no la edita", async () => {
    const carlos = getPeopleSnapshot().find((p) => p.id === CARLOS)!;
    await personService.update(CARLOS, {
      name: carlos.name,
      documentId: carlos.documentId,
      entraObjectId: carlos.entraObjectId,
      userPrincipalName: carlos.userPrincipalName,
      position: carlos.position,
      role: "TechnicalLead",
      technicalLeadId: null,
      seniority: carlos.seniority,
      modality: carlos.modality,
      availableFte: carlos.availableFte,
      monthlyCost: 12000000,
      startDate: carlos.startDate,
    });
    await expect(personService.getExpertiseLine(CARLOS)).resolves.toMatchObject(
      { name: "Backend" }
    );
    // Y el costo llegó como número: siete cifras, el caso que el campo
    // numérico no podía mostrar con separadores y que un formateo mal hecho
    // trunca sin avisar.
    const { items } = await personService.list(1, 1000);
    expect(items.find((p) => p.id === CARLOS)?.monthlyCost).toBe(12000000);
  });
});
