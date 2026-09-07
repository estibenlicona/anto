import { describe, it, expect } from "vitest";
import type {
  CapacityDto,
  CollaboratorDedicationDetailDto,
  CollaboratorDedicationRowDto,
  ReferenceDto,
  SprintExecutionDto,
  SprintTrendPointDto,
  WorkItemDto,
} from "../../services/dedicationService";
import {
  buildActivityCalendar,
  capacityBreakdownLabel,
  capacityFigures,
  demandFigures,
  formatDeltaPoints,
  formatDeltaRate,
  formatFte,
  formatPoints,
  formatRate,
  historyLabel,
  FOCUS_LEVELS,
  focusLevel,
  multitaskingCell,
  multitaskingLabel,
  signalTooltip,
  snapshotLabel,
  summaryLine,
  syncedAtLabel,
  toCollaboratorDetail,
  toCollaboratorRow,
  toEvidenceRow,
  toWorkItemRow,
} from "../DedicationAdapter";
import { MULTITASKING_WIP, MULTITASKING_WIP_STRONG } from "../balanceSignal";

// ── Fixtures ────────────────────────────────────────────────────────────────

const capacity = (
  contractualFte = 1,
  availableFte = 0.8,
  breakdown: Partial<CapacityDto["breakdown"]> = {}
): CapacityDto => ({
  contractualFte,
  availableFte,
  breakdown: {
    businessDays: 10,
    holidays: 1,
    vacationDays: 0,
    absenceDays: 1,
    otherUnavailableDays: 0,
    ...breakdown,
  },
  availableHours: Math.round(availableFte * 80),
  deductedHours: Math.round((contractualFte - availableFte) * 80),
});

const execution = (
  over: Partial<SprintExecutionDto> = {}
): SprintExecutionDto => ({
  committedPoints: 28,
  completedPoints: 22,
  notCompletedPoints: 6,
  completionRate: 78.6,
  carryOverPoints: 6,
  carryOverRate: 21.4,
  ...over,
});

const reference = (over: Partial<ReferenceDto> = {}): ReferenceDto => ({
  ownMedian: 22,
  squadMedian: 21,
  sealedSprintCount: 6,
  sufficient: true,
  ownDeviationPoints: 6,
  ownDeviationRate: 27.3,
  squadDeviationRate: 1.5,
  ...over,
});

const row = (
  over: Partial<CollaboratorDedicationRowDto> = {}
): CollaboratorDedicationRowDto => ({
  person: {
    id: "p1",
    name: "María González",
    position: "Backend Dev",
    levelLabel: "Avanzado",
    avatarUrl: null,
    contractualFte: 1,
  },
  allocation: {
    id: "a1",
    squadId: "s1",
    squadName: "Backend Platform",
    activeInitiatives: [{ id: "i1", name: "Kafka Migration", talla: "L" }],
    declaredDedicationPercentage: 80,
    declaredBauPercentage: 50,
    declaredTransformationPercentage: 30,
  },
  hasIdentity: true,
  sprint: {
    name: "S18",
    startDate: "2026-08-17",
    endDate: "2026-08-30",
    snapshotStatus: "Provisional",
    sealedAt: null,
  },
  capacity: capacity(),
  execution: execution(),
  reference: reference(),
  multitasking: {
    concurrentInitiatives: 3,
    initiatives: [
      {
        epicId: "ep-kafka",
        epicTitle: "Migración plataforma Kafka",
        initiativeId: "ini-kafka",
        initiativeName: "Kafka Migration",
        points: 16,
      },
      {
        epicId: "ep-pagos",
        epicTitle: "Pagos instantáneos · fase 1",
        initiativeId: null,
        initiativeName: null,
        points: 12,
      },
    ],
    committedWorkItems: 6,
    wip: 4,
  },
  sprintInitiatives: [
    {
      epicId: "ep-kafka",
      epicTitle: "Migración plataforma Kafka",
      initiativeId: "ini-kafka",
      initiativeName: "Kafka Migration",
      points: 16,
    },
    {
      epicId: "ep-pagos",
      epicTitle: "Pagos instantáneos · fase 1",
      initiativeId: null,
      initiativeName: null,
      points: 12,
    },
  ],
  balance: {
    signal: "PossibleOverload",
    overCount: 2,
    underCount: 0,
    squadContext: "Different",
    notEvaluableReason: null,
    evidences: [],
  },
  ...over,
});

const trendPoint = (
  name: string,
  over: Partial<SprintTrendPointDto> = {}
): SprintTrendPointDto => ({
  name,
  startDate: "2026-08-03",
  endDate: "2026-08-16",
  snapshotStatus: "Sealed",
  sealedAt: "2026-08-16T23:00:00.000Z",
  isCurrent: false,
  execution: execution({
    committedPoints: 22,
    completedPoints: 20,
    notCompletedPoints: 2,
    completionRate: 90.9,
    carryOverPoints: 4,
    carryOverRate: 18.2,
  }),
  activity: { commits: 20, releases: 1, features: 1 },
  ...over,
});

// ── Formato ─────────────────────────────────────────────────────────────────

describe("formato: tres unidades, tres formas", () => {
  it("el FTE lleva dos decimales y el contractual se escribe como el tope que es", () => {
    expect(formatFte(0.8)).toBe("0.80");
    expect(capacityFigures(capacity(1, 0.8))).toBe("0.80 / 1.0 FTE");
    expect(capacityFigures(capacity(0.5, 0.5))).toBe("0.50 / 0.50 FTE");
  });

  it("los SP son enteros y los porcentajes llevan un decimal", () => {
    expect(formatPoints(28)).toBe("28");
    expect(formatRate(78.6)).toBe("78.6 %");
    expect(formatRate(null)).toBe("–");
  });

  it("las desviaciones llevan el signo menos tipográfico", () => {
    expect(formatDeltaPoints(6)).toBe("+6 SP");
    expect(formatDeltaPoints(-11)).toBe("−11 SP");
    expect(formatDeltaRate(27.3)).toBe("+27 %");
    expect(formatDeltaRate(-55.4)).toBe("−55 %");
    expect(formatDeltaRate(null)).toBeNull();
  });

  it("la demanda se dice contra el histórico propio, o sola sin él", () => {
    expect(demandFigures(28, 22)).toBe("28 SP · habitual 22");
    expect(demandFigures(14, null)).toBe("14 SP");
  });

  it("el desglose de capacidad nombra cada día que descuenta", () => {
    expect(
      capacityBreakdownLabel({
        businessDays: 10,
        holidays: 1,
        vacationDays: 0,
        absenceDays: 1,
        otherUnavailableDays: 0,
      })
    ).toBe("10 días laborales · −1 festivo · −1 ausencia");
    expect(
      capacityBreakdownLabel({
        businessDays: 10,
        holidays: 0,
        vacationDays: 0,
        absenceDays: 0.5,
        otherUnavailableDays: 0,
      })
    ).toBe("10 días laborales · −0.5 ausencias");
  });

  it("la procedencia del snapshot se rotula con su fecha cuando la hay", () => {
    expect(snapshotLabel("Sealed", "2026-08-16T23:00:00.000Z")).toBe(
      "Sellado el 16 ago"
    );
    expect(snapshotLabel("Provisional", null)).toBe("Provisional");
    expect(snapshotLabel("Missing", null)).toBe("Sin snapshot");
  });

  it("cada evidencia se lee con su veredicto contra la tolerancia", () => {
    const evidence = (
      over: Partial<Parameters<typeof toEvidenceRow>[0]> = {}
    ) => ({
      id: "demandVsOwnHistory" as const,
      direction: "Over" as const,
      value: 51.5,
      threshold: 25,
      strong: false,
      ...over,
    });
    expect(toEvidenceRow(evidence()).verdict).toBe("Fuera de tolerancia");
    expect(toEvidenceRow(evidence({ strong: true })).verdict).toBe(
      "Fuera de tolerancia · desviación fuerte"
    );
    expect(toEvidenceRow(evidence({ direction: "Neutral" })).verdict).toBe(
      "Dentro de la tolerancia"
    );
    // Sin sprint del cual hablar, el motivo se calla en vez de inventarse.
    expect(toEvidenceRow(evidence({ direction: "Unknown" })).verdict).toBe(
      "No se pudo evaluar"
    );
    // Con el sprint en curso o sin sellar, el sprint es el motivo.
    expect(
      toEvidenceRow(evidence({ direction: "Unknown" }), "Provisional").verdict
    ).toBe("No se pudo evaluar: sprint en curso");
    expect(
      toEvidenceRow(evidence({ direction: "Unknown" }), "Missing").verdict
    ).toBe("No se pudo evaluar: sprint sin snapshot");
  });

  it("la señal lleva cuántas evidencias la sostienen, o su motivo", () => {
    expect(
      signalTooltip({
        signal: "PossibleOverload",
        overCount: 4,
        underCount: 0,
        squadContext: "Different",
        notEvaluableReason: null,
        evidences: [],
      })
    ).toBe("Posible sobreasignación · 4 señales concurrentes");
    expect(
      signalTooltip({
        signal: "NotEvaluable",
        overCount: 0,
        underCount: 0,
        squadContext: "NoSquad",
        notEvaluableReason: "InsufficientHistory",
        evidences: [],
      })
    ).toBe("No evaluable · Histórico insuficiente");
  });

  it("la multitarea dice iniciativas y HUs, y calla lo que no se pudo reconstruir", () => {
    expect(
      multitaskingLabel({
        concurrentInitiatives: 3,
        initiatives: [],
        committedWorkItems: 6,
        wip: 4,
      })
    ).toBe("3 iniciativas · 4 HUs");
    expect(
      multitaskingLabel({
        concurrentInitiatives: 1,
        initiatives: [],
        committedWorkItems: 2,
        wip: null,
      })
    ).toBe("1 iniciativa");
  });

  it("el foco escala por los mismos umbrales con los que la evidencia cuenta", () => {
    // Una sola HU en curso es el trabajo de a uno; dos o tres ya reparten.
    expect(focusLevel(0)).toBe(1);
    expect(focusLevel(1)).toBe(1);
    expect(focusLevel(2)).toBe(2);
    expect(focusLevel(MULTITASKING_WIP - 1)).toBe(2);
    // El umbral con el que la multitarea empieza a contar hacia sobrecarga.
    expect(focusLevel(MULTITASKING_WIP)).toBe(3);
    expect(focusLevel(MULTITASKING_WIP_STRONG - 1)).toBe(3);
    // Y el de la desviación fuerte, que llena el medidor.
    expect(focusLevel(MULTITASKING_WIP_STRONG)).toBe(FOCUS_LEVELS);
    expect(focusLevel(12)).toBe(FOCUS_LEVELS);
    // Sin historial de estados no hay foco que medir: un medidor en cero se
    // leería como foco pleno, que es lo contrario de "no se sabe".
    expect(focusLevel(null)).toBeNull();
  });

  it("la celda de foco lleva el medidor y las cifras que lo sostienen", () => {
    expect(
      multitaskingCell({
        concurrentInitiatives: 2,
        initiatives: [],
        committedWorkItems: 6,
        wip: 4,
      })
    ).toEqual({ label: "2 iniciativas · 4 HUs", level: 3 });
    expect(
      multitaskingCell({
        concurrentInitiatives: 1,
        initiatives: [],
        committedWorkItems: 2,
        wip: null,
      })
    ).toEqual({ label: "1 iniciativa", level: null });
  });

  it("el histórico dice cuántos sprints hay y cuántos faltan", () => {
    expect(historyLabel(reference(), 3)).toBe("6 sprints sellados");
    expect(
      historyLabel(reference({ sealedSprintCount: 2, sufficient: false }), 3)
    ).toBe("Faltan 1 de 3 sprints sellados (hay 2)");
  });

  it("la línea de resumen dice lo esencial en lenguaje natural", () => {
    expect(summaryLine(28, 22, 3, 18)).toBe(
      "28 SP comprometidos vs 22 SP habituales · 3 iniciativas activas · 18.0 % carry-over histórico"
    );
    expect(summaryLine(14, null, 1, null)).toBe(
      "14 SP comprometidos · 1 iniciativa activa"
    );
  });

  it("la última actualización se dice en relativo", () => {
    const now = new Date("2026-08-22T10:00:00Z");
    expect(
      syncedAtLabel(new Date("2026-08-22T09:48:00Z").toISOString(), now)
    ).toBe("Actualizado hace 12 min");
    expect(syncedAtLabel(null, now)).toBe("Sin actualizar");
  });
});

// ── Listado ─────────────────────────────────────────────────────────────────

describe("toCollaboratorRow", () => {
  it("arma la fila con capacidad, demanda, multitarea y señal", () => {
    const result = toCollaboratorRow(row());
    expect(result).toMatchObject({
      id: "p1",
      name: "María González",
      initials: "MG",
      hasIdentity: true,
      hasSprint: true,
      squadName: "Backend Platform",
      sprintName: "S18",
      sprintRange: "17 ago – 30 ago",
      snapshotLabel: "Provisional",
      capacityFigures: "0.80 / 1.0 FTE",
      capacityBreakdown: "10 días laborales · −1 festivo · −1 ausencia",
      capacityHours: "64 h · −16 h por ausencias",
      deviation: "+27 %",
      tolerance: "Tolerancia ±25 %",
      // Dos iniciativas distintas: se nombra la primera y la otra va en "+1".
      extraInitiatives: 1,
      committedPoints: 28,
      demandFigures: "28 SP · habitual 22",
      multitaskingLabel: "3 iniciativas · 4 HUs",
      signalTooltip: "Posible sobreasignación · 2 señales concurrentes",
    });
  });

  it("sin sprint no inventa cifras de capacidad ni de demanda", () => {
    const result = toCollaboratorRow(
      row({
        sprint: null,
        hasIdentity: false,
        balance: {
          signal: "NotEvaluable",
          overCount: 0,
          underCount: 0,
          squadContext: "NoSquad",
          notEvaluableReason: "NoIdentity",
          evidences: [],
        },
      })
    );
    expect(result.capacityFigures).toBeNull();
    expect(result.demandFigures).toBeNull();
    expect(result.multitaskingLabel).toBeNull();
    expect(result.snapshotLabel).toBeNull();
    expect(result.signalTooltip).toBe("No evaluable · Sin identidad DevOps");
  });
});

// ── Historias ───────────────────────────────────────────────────────────────

const workItem = (over: Partial<WorkItemDto> = {}): WorkItemDto => ({
  id: "wi-1",
  number: 12320,
  title: "Cutover de los tópicos de pago",
  tag: "Initiative",
  epicId: "ep-kafka",
  epicTitle: "Migración plataforma Kafka",
  initiativeId: "ini-kafka",
  initiativeName: "Kafka Migration",
  points: 8,
  state: "Active",
  addedAfterSprintStart: false,
  board: "Backend Core",
  url: "https://dev.azure.com/tuya/_workitems/edit/12320",
  ...over,
});

describe("toWorkItemRow", () => {
  it("rotula la iniciativa mapeada y no marca la épica como sin mapear", () => {
    expect(toWorkItemRow(workItem())).toMatchObject({
      kind: "Initiative",
      tagLabel: "Iniciativa · Kafka Migration",
      epicTitle: "Migración plataforma Kafka",
      epicUnmapped: false,
      addedAfterSprintStart: false,
    });
  });

  it("marca la épica que todavía no está mapeada a una iniciativa", () => {
    expect(
      toWorkItemRow(
        workItem({
          epicId: "ep-pagos",
          epicTitle: "Pagos instantáneos · fase 1",
          initiativeId: null,
          initiativeName: null,
        })
      )
    ).toMatchObject({ tagLabel: "Iniciativa", epicUnmapped: true });
  });

  it("marca la historia que entró con el sprint ya arrancado", () => {
    expect(
      toWorkItemRow(
        workItem({
          tag: "Bau",
          epicId: null,
          epicTitle: null,
          addedAfterSprintStart: true,
        })
      )
    ).toMatchObject({
      kind: "Bau",
      tagLabel: "BAU",
      epicUnmapped: false,
      addedAfterSprintStart: true,
    });
  });
});

// ── Mapa de actividad ───────────────────────────────────────────────────────

describe("buildActivityCalendar", () => {
  it("agrupa por semanas de lunes a domingo con los totales y la última actividad", () => {
    const calendar = buildActivityCalendar(
      "2026-08-17",
      "2026-08-30",
      [
        { date: "2026-08-18", commits: 4, releases: 0, features: 0 },
        { date: "2026-08-20", commits: 2, releases: 1, features: 0 },
      ],
      new Date(2026, 7, 22)
    );
    expect(calendar.weeks).toHaveLength(2);
    expect(calendar.weeks[0]).toHaveLength(7);
    expect(calendar.totals).toEqual({
      commits: 6,
      releases: 1,
      features: 0,
      total: 7,
    });
    expect(calendar.activeDays).toBe(2);
    expect(calendar.lastActivityLabel).toBe("Última actividad el jue 20 ago");
    expect(calendar.hasActivity).toBe(true);
    const day = calendar.weeks[0].find((c) => c.date === "2026-08-20")!;
    expect(day.label).toBe("jue 20 ago · 2 commits · 1 release");
  });

  it("un sprint sin actividad lo dice, sin celdas encendidas", () => {
    const calendar = buildActivityCalendar(
      "2026-08-03",
      "2026-08-16",
      [],
      new Date(2026, 7, 22)
    );
    expect(calendar.hasActivity).toBe(false);
    expect(calendar.activeDays).toBe(0);
    expect(calendar.lastActivityLabel).toBeNull();
    expect(calendar.weeks.flat().every((c) => c.level === 0)).toBe(true);
  });
});

// ── Detalle ─────────────────────────────────────────────────────────────────

const detail = (
  over: Partial<CollaboratorDedicationDetailDto> = {}
): CollaboratorDedicationDetailDto => {
  const base = row();
  return {
    person: base.person,
    allocation: base.allocation,
    hasIdentity: true,
    settings: {
      historyWindowSprints: 6,
      minHistorySprints: 3,
      hoursPerSprint: 80,
    },
    lastSyncedAt: "2026-08-22T09:48:00.000Z",
    sprints: [
      trendPoint("S16", {
        startDate: "2026-07-20",
        endDate: "2026-08-02",
        snapshotStatus: "Missing",
        sealedAt: null,
        execution: execution({
          committedPoints: 20,
          completedPoints: null,
          notCompletedPoints: null,
          completionRate: null,
          carryOverPoints: null,
          carryOverRate: null,
        }),
      }),
      trendPoint("S17"),
      trendPoint("S18", {
        startDate: "2026-08-17",
        endDate: "2026-08-30",
        snapshotStatus: "Provisional",
        sealedAt: null,
        isCurrent: true,
        execution: execution(),
      }),
    ],
    selectedSprint: {
      name: "S18",
      startDate: "2026-08-17",
      endDate: "2026-08-30",
      snapshotStatus: "Provisional",
      sealedAt: null,
      capacity: capacity(),
      execution: execution(),
      unplannedWork: {
        committedAtStartPoints: 22,
        addedDuringSprintPoints: 8,
        totalWorkedPoints: 30,
        unplannedRate: 36.4,
      },
      multitasking: base.multitasking,
      reference: reference(),
      balance: {
        signal: "PossibleOverload",
        overCount: 2,
        underCount: 0,
        squadContext: "SameDirection",
        notEvaluableReason: null,
        evidences: [
          {
            id: "demandVsOwnHistory",
            direction: "Over",
            value: 27.3,
            threshold: 25,
            strong: false,
          },
          {
            id: "carryOver",
            direction: "Unknown",
            value: null,
            threshold: null,
            strong: false,
          },
        ],
      },
      workItems: [workItem()],
      activity: [{ date: "2026-08-18", commits: 4, releases: 0, features: 0 }],
    },
    ...over,
  };
};

describe("toCollaboratorDetail", () => {
  it("arma la cabecera, la línea de resumen y los paneles del sprint elegido", () => {
    const result = toCollaboratorDetail(detail(), new Date(2026, 7, 22));

    expect(result.person).toMatchObject({
      name: "María González",
      initials: "MG",
      contractualFte: 1,
    });
    expect(result.declaredLabel).toBe("80 % declarado por la célula");
    expect(result.hasSprints).toBe(true);

    const selected = result.selected!;
    expect(selected.capacityFigures).toBe("0.80 / 1.0 FTE");
    expect(selected.committedLabel).toBe("28 SP");
    expect(selected.completionLabel).toBe("78.6 %");
    expect(selected.carryOverLabel).toBe("6 SP · 21.4 %");
    expect(selected.unplannedRateLabel).toBe("36.4 %");
    expect(selected.multitaskingLabel).toBe("3 iniciativas · 4 HUs");
    expect(selected.deviationLabel).toBe("+6 SP · +27 %");
    expect(selected.historyLabel).toBe("6 sprints sellados");
    // Sólo S17 está sellado, y su carry-over es el histórico del colaborador.
    expect(selected.summaryLine).toBe(
      "28 SP comprometidos vs 22 SP habituales · 3 iniciativas activas · 18.2 % carry-over histórico"
    );
    // Las cuatro pestañas dicen qué hay dentro sin abrirlas.
    expect(result.tabs.map((t) => [t.label, t.subtitle])).toEqual([
      ["Señales", "1 de 2 hacia sobrecarga"],
      ["Historias", "1 historia · 28 SP"],
      ["Actividad", "1 día activo · 4 commits"],
      // Sólo S17 está sellado de los tres: sin dos, no hay movimiento del cual
      // hablar y la pestaña dice cuántos sprints hay y nada más.
      ["Tendencia", "3 sprints"],
    ]);
    expect(selected.snapshotNote).toMatch(/sigue en curso/);
    expect(selected.squadModifier).toMatch(/Contexto de célula/);
    // Las cuatro métricas de la cabecera, en su orden y con su lectura. El
    // rojo lo decide la evidencia del mismo nombre, no la tarjeta.
    expect(
      selected.metrics.map((m) => [
        m.label,
        m.value,
        m.detail,
        m.outOfTolerance,
      ])
    ).toEqual([
      ["Cumplimiento", "78.6 %", "22 de 28 SP en Closed", false],
      // Sólo la demanda cuenta como evidencia en esta semilla: ninguna de las
      // cuatro se pinta, porque el tono lo decide la evidencia y no la tarjeta.
      ["Trabajo no planificado", "36.4 %", "+8 SP sobre 22", false],
      ["Carry-over", "21.4 %", "6 SP", false],
      ["Foco", "3", "iniciativas · 4 HUs abiertas a la vez", false],
    ]);
    // El veredicto se dice contra la tolerancia, y el sprint en curso explica
    // por qué la que no se pudo evaluar quedó sin evaluar.
    expect(selected.evidences.map((e) => e.verdict)).toEqual([
      "Fuera de tolerancia",
      "No se pudo evaluar: sprint en curso",
    ]);
    // La iniciativa nombra la fila y la épica dice qué se contó; sin mapeo, la
    // épica es el nombre de la fila y se marca como tal.
    expect(
      selected.initiatives.map((i) => [i.name, i.epicTitle, i.isUnmappedEpic])
    ).toEqual([
      ["Kafka Migration", "Migración plataforma Kafka", false],
      ["Pagos instantáneos · fase 1", null, true],
    ]);
  });

  it("la referencia son tres cifras con célula y dos sin ella", () => {
    const withSquad = toCollaboratorDetail(detail(), new Date(2026, 7, 22));
    expect(withSquad.selected!.referenceLines.map((l) => l.key)).toEqual([
      "own",
      "squad",
      "current",
    ]);
    expect(withSquad.selected!.referenceLines[1].value).toBe("21 SP");

    const noSquad = toCollaboratorDetail(
      detail({ allocation: null }),
      new Date(2026, 7, 22)
    );
    expect(noSquad.selected!.referenceLines.map((l) => l.key)).toEqual([
      "own",
      "current",
    ]);
    expect(noSquad.declaredLabel).toBeNull();
  });

  it("un sprint sin snapshot queda fuera del histórico y sin cifras de cierre", () => {
    const result = toCollaboratorDetail(detail(), new Date(2026, 7, 22));
    const missing = result.sprints.find((s) => s.name === "S16")!;
    expect(missing.snapshotLabel).toBe("Sin snapshot");
    expect(missing.countsForHistory).toBe(false);
    expect(missing.completionLabel).toBe("–");
    expect(missing.carryOverLabel).toBe("–");

    const sealed = result.sprints.find((s) => s.name === "S17")!;
    expect(sealed.snapshotLabel).toBe("Sellado el 16 ago");
    expect(sealed.countsForHistory).toBe(true);
    expect(sealed.completionLabel).toBe("90.9 %");
  });

  it("sin identidad ni sprints no hay sprint elegido", () => {
    const result = toCollaboratorDetail(
      detail({ hasIdentity: false, sprints: [], selectedSprint: null }),
      new Date(2026, 7, 22)
    );
    expect(result.hasSprints).toBe(false);
    expect(result.selected).toBeNull();
  });
});
