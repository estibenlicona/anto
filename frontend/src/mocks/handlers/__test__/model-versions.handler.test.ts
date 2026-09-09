import { describe, it, expect, beforeEach } from "vitest";
import { estimationModelService } from "@features/admin-shell/services/estimationModelService";
import { initiativeService } from "@features/initiatives/services/initiativeService";
import { resetModelVersionsMock } from "../model-versions.handlers";
import { resetInitiativesMock } from "../initiatives.handlers";
import { MODEL_ID } from "../model-versions.seeds";

const AUTHOR = "Estiben Licona";

async function status(fn: () => Promise<unknown>): Promise<number> {
  try {
    await fn();
    return 200;
  } catch (e) {
    return (e as { response?: { status: number } }).response?.status ?? 0;
  }
}

beforeEach(() => {
  resetModelVersionsMock();
  resetInitiativesMock();
});

describe("modelos y versiones", () => {
  it("lista las versiones de la más nueva a la más vieja con su estado", async () => {
    const models = await estimationModelService.getModels();

    const model = models[0];
    expect(model.id).toBe(MODEL_ID);
    expect(model.versions.map((v) => v.number)).toEqual([3, 2, 1]);
    expect(model.versions.map((v) => v.status)).toEqual([
      "Borrador",
      "Vigente",
      "Archivada",
    ]);
  });

  it("dice cuántas estimaciones calculó cada versión", async () => {
    const [model] = await estimationModelService.getModels();

    // Es lo que convierte una fila en una decisión: una versión que ya calculó
    // no se toca, se copia.
    expect(model.versions.find((v) => v.number === 1)?.estimationsCount).toBe(123);
    expect(model.versions.find((v) => v.number === 3)?.estimationsCount).toBe(0);
  });

  it("el contenido de una versión trae todo lo que el motor necesita", async () => {
    const version = await estimationModelService.getVersion(MODEL_ID, 2);

    expect(version.versionNumber).toBe(2);
    expect(version.dimensions).toHaveLength(7);
    expect(version.questions).toHaveLength(30);
    expect(version.drivers).toHaveLength(7);
    expect(version.tallaRules).toHaveLength(5);
    expect(version.mix).toHaveLength(6);
  });

  it("una versión que no existe responde 404", async () => {
    expect(await status(() => estimationModelService.getVersion(MODEL_ID, 99))).toBe(404);
  });
});

describe("crear una versión a partir de otra", () => {
  it("la nueva nace en borrador con el contenido copiado y la de origen queda intacta", async () => {
    // Primero se publica el borrador que ya viene sembrado, para que no haya
    // dos abiertos.
    await estimationModelService.publish(MODEL_ID, 3, {
      author: AUTHOR,
      effectiveFrom: "2026-04-01",
      note: "Tercera.",
    });

    const created = await estimationModelService.createVersion(MODEL_ID, {
      author: AUTHOR,
      sourceVersion: 3,
    });

    expect(created).toEqual({ number: 4, status: "Borrador" });

    const source = await estimationModelService.getVersion(MODEL_ID, 3);
    const copy = await estimationModelService.getVersion(MODEL_ID, 4);
    expect(copy.questions).toHaveLength(source.questions.length);
    expect(copy.versionNumber).toBe(4);

    const [model] = await estimationModelService.getModels();
    expect(model.versions.find((v) => v.number === 3)?.status).toBe("Vigente");
  });

  it("no se abre un segundo borrador sobre el mismo modelo", async () => {
    expect(
      await status(() =>
        estimationModelService.createVersion(MODEL_ID, {
          author: AUTHOR,
          sourceVersion: 2,
        })
      )
    ).toBe(409);
  });

  it("crear sin autor se rechaza", async () => {
    expect(
      await status(() =>
        estimationModelService.createVersion(MODEL_ID, { author: "  ", sourceVersion: 2 })
      )
    ).toBe(400);
  });
});

describe("guardar una sección del borrador", () => {
  it("persiste la sección y deja el resto sin tocar", async () => {
    const before = await estimationModelService.getVersion(MODEL_ID, 3);

    await estimationModelService.saveTallaRules(MODEL_ID, 3, {
      author: AUTHOR,
      boundaries: [10, 40, 60, 80],
      rules: before.tallaRules.map((r) => ({
        talla: r.talla,
        pmMin: r.pmMin,
        pmExpected: r.pmExpected,
        pmMax: r.pmMax,
        lectura: r.lectura,
        action: r.action,
      })),
      riskBands: before.riskBands.map((b) => ({ ...b })),
    });

    const after = await estimationModelService.getVersion(MODEL_ID, 3);
    expect(after.tallaRules[0].maxPct).toBe(10);
    expect(after.questions).toHaveLength(before.questions.length);
  });

  it("guardar los pesos no pisa el texto de la pregunta", async () => {
    const before = await estimationModelService.getVersion(MODEL_ID, 3);
    const first = before.questions[0];

    await estimationModelService.saveDrivers(MODEL_ID, 3, {
      author: AUTHOR,
      drivers: before.drivers.map((d) => ({
        code: d.code,
        description: d.description,
        outputs: d.outputs,
      })),
      weights: [{ questionCode: first.id, weights: { Size: 9 } }],
    });

    const after = await estimationModelService.getVersion(MODEL_ID, 3);
    const question = after.questions.find((q) => q.id === first.id)!;
    expect(question.text).toBe(first.text);
    expect(question.weights.Size).toBe(9);
    // Effort venía con peso y no llegó en el cuerpo: se fue, que es lo que
    // significa mandar la fila entera.
    expect(question.weights.Effort).toBeUndefined();
  });

  it("guardar las dimensiones conserva los pesos que las preguntas ya tenían", async () => {
    const before = await estimationModelService.getVersion(MODEL_ID, 3);
    const question = before.questions[0];

    await estimationModelService.saveDimensions(MODEL_ID, 3, {
      author: AUTHOR,
      dimensions: before.dimensions.map((d) => ({ ...d })),
      questions: [
        {
          code: question.id,
          dimensionCode: question.dimension,
          texto: "Texto nuevo",
          type: question.type,
          driverCode: question.driver,
          active: true,
          options: question.options.map((o) => ({ label: o.label, score: o.score })),
        },
      ],
      triage: before.triage.map((t) => ({
        code: t.id,
        texto: t.text,
        critical: t.critical,
      })),
    });

    const after = await estimationModelService.getVersion(MODEL_ID, 3);
    expect(after.questions).toHaveLength(1);
    expect(after.questions[0].text).toBe("Texto nuevo");
    expect(after.questions[0].weights.Size).toBe(question.weights.Size);
  });

  it("escribir sobre una versión publicada responde 409 y no la cambia", async () => {
    const before = await estimationModelService.getVersion(MODEL_ID, 2);

    const code = await status(() =>
      estimationModelService.saveMix(MODEL_ID, 2, {
        author: AUTHOR,
        mix: [],
        modifiers: [],
      })
    );

    expect(code).toBe(409);
    const after = await estimationModelService.getVersion(MODEL_ID, 2);
    expect(after.mix).toHaveLength(before.mix.length);
  });

  it("escribir sin autor responde 400 y no guarda nada", async () => {
    const before = await estimationModelService.getVersion(MODEL_ID, 3);

    const code = await status(() =>
      estimationModelService.saveMix(MODEL_ID, 3, { author: "", mix: [], modifiers: [] })
    );

    expect(code).toBe(400);
    const after = await estimationModelService.getVersion(MODEL_ID, 3);
    expect(after.mix).toHaveLength(before.mix.length);
  });

  it("reiniciar el mock devuelve las versiones a su valor inicial", async () => {
    await estimationModelService.saveMix(MODEL_ID, 3, {
      author: AUTHOR,
      mix: [],
      modifiers: [],
    });
    expect((await estimationModelService.getVersion(MODEL_ID, 3)).mix).toHaveLength(0);

    resetModelVersionsMock();

    expect((await estimationModelService.getVersion(MODEL_ID, 3)).mix).toHaveLength(6);
  });
});

describe("validación y publicación", () => {
  it("una versión completa pasa los nueve chequeos", async () => {
    const report = await estimationModelService.getValidation(MODEL_ID, 3);

    expect(report.checks).toHaveLength(9);
    expect(report.canPublish).toBe(true);
    expect(report.impedimentCount).toBe(0);
  });

  it("la validación dice qué falta y en qué sección se arregla", async () => {
    const before = await estimationModelService.getVersion(MODEL_ID, 3);

    await estimationModelService.saveMix(MODEL_ID, 3, {
      author: AUTHOR,
      mix: before.mix.map((m) => ({
        key: m.capability,
        capacidad: m.capability,
        porTalla:
          m.capability === "Backend Dev"
            ? { ...m.byTalla, XS: 99 }
            : { ...m.byTalla },
      })),
      modifiers: [],
    });

    const report = await estimationModelService.getValidation(MODEL_ID, 3);
    const failed = report.checks.filter((c) => c.status === "impedimento");

    expect(failed).toHaveLength(1);
    expect(failed[0].code).toBe("MIX");
    expect(failed[0].section).toBe("mix");
    expect(failed[0].missing).toContain("XS");
    expect(report.canPublish).toBe(false);
  });

  it("publicar con impedimentos no publica y devuelve la lista", async () => {
    const before = await estimationModelService.getVersion(MODEL_ID, 3);
    await estimationModelService.saveTallaRules(MODEL_ID, 3, {
      author: AUTHOR,
      boundaries: [20, 40, 60, 80],
      rules: before.tallaRules.map((r) => ({
        talla: r.talla,
        pmMin: r.pmMin,
        pmExpected: r.pmExpected,
        pmMax: r.pmMax,
        lectura: r.lectura,
        action: r.action,
      })),
      riskBands: [{ level: "Bajo", maxPct: 33 }],
    });

    const outcome = await estimationModelService.publish(MODEL_ID, 3, {
      author: AUTHOR,
      effectiveFrom: "2026-04-01",
      note: "Tercera.",
    });

    expect(outcome.published).toBe(false);
    expect(outcome.report.impedimentCount).toBe(1);

    const [model] = await estimationModelService.getModels();
    expect(model.versions.find((v) => v.number === 3)?.status).toBe("Borrador");
    expect(model.versions.find((v) => v.number === 2)?.status).toBe("Vigente");
  });

  it("publicar una versión válida la deja vigente y archiva la anterior", async () => {
    const outcome = await estimationModelService.publish(MODEL_ID, 3, {
      author: AUTHOR,
      effectiveFrom: "2026-04-01",
      note: "Se recalibró el mix.",
    });

    expect(outcome.published).toBe(true);

    const [model] = await estimationModelService.getModels();
    expect(model.versions.find((v) => v.number === 3)?.status).toBe("Vigente");
    expect(model.versions.find((v) => v.number === 2)?.status).toBe("Archivada");
    expect(model.versions.find((v) => v.number === 2)?.effectiveTo).toBe("2026-04-01");
  });

  it("publicar sin autor se rechaza", async () => {
    expect(
      await status(() =>
        estimationModelService.publish(MODEL_ID, 3, {
          author: "",
          effectiveFrom: "2026-04-01",
          note: "Tercera.",
        })
      )
    ).toBe(400);
  });

  it("las diferencias se comparan contra la vigente, por sección", async () => {
    await estimationModelService.saveTallaRules(MODEL_ID, 3, {
      author: AUTHOR,
      boundaries: [10, 40, 60, 80],
      rules: (await estimationModelService.getVersion(MODEL_ID, 3)).tallaRules.map((r) => ({
        talla: r.talla,
        pmMin: r.pmMin,
        pmExpected: r.pmExpected,
        pmMax: r.pmMax,
        lectura: r.lectura,
        action: r.action,
      })),
      riskBands: (await estimationModelService.getVersion(MODEL_ID, 3)).riskBands,
    });

    const diff = await estimationModelService.getDiff(MODEL_ID, 3);

    expect(diff.fromVersion).toBe(2);
    expect(diff.toVersion).toBe(3);
    const changed = diff.entries.find((e) => e.item.includes("XS"));
    expect(changed?.kind).toBe("cambiado");
    expect(changed?.section).toBe("tallas");
    expect(changed?.before).not.toBe(changed?.after);
  });

  it("el historial va de lo más nuevo a lo más viejo y siempre tiene autor", async () => {
    await estimationModelService.saveMix(MODEL_ID, 3, {
      author: AUTHOR,
      mix: [],
      modifiers: [],
    });

    const history = await estimationModelService.getHistory(MODEL_ID, 3);

    expect(history.length).toBeGreaterThan(1);
    expect(history[0].author).toBe(AUTHOR);
    expect(history[0].section).toBe("mix");
    expect(
      [...history].sort((a, b) => b.occurredAtUtc.localeCompare(a.occurredAtUtc))
    ).toEqual(history);
  });
});

describe("la estimación y su versión", () => {
  it("guardar una evaluación deja escrita la versión vigente", async () => {
    const page = await initiativeService.list(1, 50);
    const target = page.items.find((i) => i.evaluation === null)!;
    const model = await initiativeService.getEvaluationModel();

    const saved = await initiativeService.saveEvaluation(target.id, {
      triage: model.triage.map(() => false),
      answers: Object.fromEntries(model.questions.map((q) => [q.id, 2])),
      targetMonths: 6,
    });

    expect(saved.evaluation?.modelVersionNumber).toBe(2);
    expect(saved.evaluation?.modelVersionId).toBe("MOD-F1-V2");
  });

  it("una respuesta que no es opción de la pregunta responde 400", async () => {
    const page = await initiativeService.list(1, 50);
    const target = page.items.find((i) => i.evaluation === null)!;
    const model = await initiativeService.getEvaluationModel();

    const code = await status(() =>
      initiativeService.saveEvaluation(target.id, {
        triage: model.triage.map(() => false),
        answers: { ...Object.fromEntries(model.questions.map((q) => [q.id, 2])), [model.questions[0].id]: 5 },
        targetMonths: 6,
      })
    );

    expect(code).toBe(400);
  });

  it("publicar una versión nueva no toca la evaluación ya guardada", async () => {
    const page = await initiativeService.list(1, 50);
    const target = page.items.find((i) => i.evaluation === null)!;
    const model = await initiativeService.getEvaluationModel();

    const saved = await initiativeService.saveEvaluation(target.id, {
      triage: model.triage.map(() => false),
      answers: Object.fromEntries(model.questions.map((q) => [q.id, 3])),
      targetMonths: 6,
    });

    await estimationModelService.publish(MODEL_ID, 3, {
      author: AUTHOR,
      effectiveFrom: "2026-04-01",
      note: "Tercera.",
    });

    const after = await initiativeService.get(target.id);
    expect(after.evaluation?.talla).toBe(saved.evaluation?.talla);
    expect(after.evaluation?.modelVersionNumber).toBe(2);
  });
});
