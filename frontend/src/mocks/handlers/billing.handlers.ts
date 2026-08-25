import { http, HttpResponse } from "msw";
import type {
  AbsenceDiscountDto,
  AdjustmentReason,
  BillingAdjustmentDto,
  BillingStatus,
  ImputationDto,
  ObjectionDto,
  PrefactureDocumentDto,
  PrefactureDto,
} from "@features/billing/services/billingService";
import { getAllocationsSnapshot } from "./allocations.handlers";
import {
  getCompaniesSnapshot,
  getPeopleSnapshot,
  peopleFor,
} from "./people.handlers";
// El descuento por ausencias no se digita: sale de las ausencias aprobadas.
// La cuenta de días hábiles vive en el handler de ausencias, así que una misma
// ausencia se lee igual en las dos pantallas.
import { getApprovedAbsencesSnapshot } from "./absences.handlers";
import { BILLING_SEEDS, type BillingSeed } from "./billing.seeds";

const BASE = "/billing";
const REASONS: AdjustmentReason[] = [
  "Overtime",
  "PartialEntry",
  "Exit",
  "Other",
];
const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const EMPTY_IMPUTATION: ImputationDto = {
  costObject: null,
  concept: null,
  accountName: null,
  accountNumber: null,
  costCenter: null,
  purchaseOrder: null,
  paymentAccount: null,
};

/**
 * Lo que el mock persiste: una prefactura por persona y período. Todo lo
 * calculado se deriva al responder.
 */
interface StoredPrefacture {
  id: string;
  personId: string;
  personName: string;
  position: string;
  squadName: string | null;
  providerId: string;
  period: string;
  status: BillingStatus;
  monthlyCost: number;
  adjustment: BillingAdjustmentDto | null;
  /** Lo que el proveedor propone cobrar; `null` mientras no llegó. */
  prefactured: number | null;
  document: PrefactureDocumentDto | null;
  objection: ObjectionDto | null;
  approvalNote: string | null;
  /** Descuento congelado al aprobar: una prefactura aprobada no se mueve más. */
  frozenDiscount: AbsenceDiscountDto | null;
  createdAtUtc: string;
  approvedAtUtc: string | null;
}

/**
 * Descuento de una persona en un período: tarifa × (días hábiles ausentes ÷
 * días hábiles del mes), sumando sus ausencias aprobadas. Redondeado a pesos.
 */
function deriveDiscount(
  personId: string,
  period: string,
  monthlyCost: number
): AbsenceDiscountDto | null {
  const { monthBusinessDays, items } = getApprovedAbsencesSnapshot(period);
  if (monthBusinessDays <= 0) return null;
  const businessDays = items
    .filter((a) => a.personId === personId)
    .reduce((acc, a) => acc + a.businessDaysInMonth, 0);
  if (businessDays === 0) return null;
  return {
    businessDays,
    amount: Math.round(monthlyCost * (businessDays / monthBusinessDays)),
  };
}

/** Completa el registro con lo calculado: descuento, esperado y diferencia. */
function toDto(stored: StoredPrefacture): PrefactureDto {
  const provider = getCompaniesSnapshot().find(
    (c) => c.id === stored.providerId
  );
  // Aprobada: las cifras quedaron congeladas con la aprobación. Antes de eso
  // el descuento se vuelve a derivar, porque aprobar una ausencia después de
  // generar el mes es lo normal.
  const absenceDiscount =
    stored.status === "Approved"
      ? stored.frozenDiscount
      : deriveDiscount(stored.personId, stored.period, stored.monthlyCost);
  const expected =
    stored.monthlyCost -
    (absenceDiscount?.amount ?? 0) +
    (stored.adjustment?.amount ?? 0);
  return {
    id: stored.id,
    personId: stored.personId,
    personName: stored.personName,
    position: stored.position,
    squadName: stored.squadName,
    providerId: stored.providerId,
    providerName: provider?.name ?? "",
    period: stored.period,
    status: stored.status,
    monthlyCost: stored.monthlyCost,
    absenceDiscount,
    adjustment: stored.adjustment,
    expected,
    document: stored.document,
    prefactured: stored.prefactured,
    difference:
      stored.prefactured === null ? null : stored.prefactured - expected,
    objection: stored.objection,
    approvalNote: stored.approvalNote,
    createdAtUtc: stored.createdAtUtc,
    approvedAtUtc: stored.approvedAtUtc,
  };
}

/** Las personas externas vigentes, congeladas con los datos de hoy. */
/**
 * Las personas externas sobre las que hay algo que facturar. Recibe de quién:
 * las semillas parten del conjunto completo —los registros existen igual—, y
 * las rutas pasan sólo las que quien pide tiene a cargo, que es lo que la
 * pantalla enumera.
 */
function externals(
  source = getPeopleSnapshot()
): Array<
  Pick<
    StoredPrefacture,
    | "personId"
    | "personName"
    | "position"
    | "squadName"
    | "providerId"
    | "monthlyCost"
  >
> {
  const allocations = getAllocationsSnapshot();
  return source
    .filter((p) => p.providerId !== null)
    .map((p) => ({
      personId: p.id,
      personName: p.name,
      position: p.position,
      squadName:
        allocations.find((a) => a.personId === p.id)?.squadName ?? null,
      providerId: p.providerId as string,
      monthlyCost: p.monthlyCost,
    }));
}

function blank(
  base: ReturnType<typeof externals>[number],
  period: string
): StoredPrefacture {
  return {
    ...base,
    id: `pref-${period}-${base.personId.slice(1, 5)}`,
    period,
    status: "Pending",
    adjustment: null,
    prefactured: null,
    document: null,
    objection: null,
    approvalNote: null,
    frozenDiscount: null,
    createdAtUtc: new Date().toISOString(),
    approvedAtUtc: null,
  };
}

function fromSeed(seed: BillingSeed): StoredPrefacture[] {
  return externals()
    .filter((e) => e.providerId === seed.providerId)
    .map((e) => {
      const adjustment = seed.adjustments?.[e.personName] ?? null;
      const prefactured =
        seed.invoice === undefined
          ? null
          : (seed.invoicedOverrides?.[e.personName] ?? e.monthlyCost);
      // Las aprobadas congelan lo que tenían al aprobarse.
      const frozenDiscount =
        seed.status === "Approved"
          ? deriveDiscount(e.personId, seed.period, e.monthlyCost)
          : null;
      const document: PrefactureDocumentDto | null = seed.invoice
        ? {
            number: `${seed.invoice.number}-${e.personId.slice(1, 3)}`,
            receivedAt: seed.invoice.receivedAt,
            amount: prefactured ?? e.monthlyCost,
            currency: "COP",
            imputation: {
              ...EMPTY_IMPUTATION,
              costObject: e.squadName,
              concept: "Servicios profesionales",
              accountName: "Servicios técnicos",
              accountNumber: "5135-05",
              costCenter: seed.costCenter ?? "CC-1001",
              // La orden de compra llega después del documento a propósito:
              // es el caso que prueba que un dato faltante se distingue.
              purchaseOrder: seed.purchaseOrder ?? null,
              paymentAccount: "Bancolombia 4567",
            },
          }
        : null;
      return {
        ...e,
        id: `pref-${seed.period}-${e.personId.slice(1, 5)}`,
        period: seed.period,
        status: seed.status,
        adjustment,
        prefactured,
        document,
        objection: seed.objection ?? null,
        approvalNote: seed.approvalNote ?? null,
        frozenDiscount,
        createdAtUtc: seed.createdAtUtc,
        approvedAtUtc: seed.status === "Approved" ? seed.createdAtUtc : null,
      };
    });
}

const seeded = () => BILLING_SEEDS.flatMap(fromSeed);

let prefactures: StoredPrefacture[] = seeded();

export function resetBillingMock() {
  prefactures = seeded();
}

/** Sólo lectura para otros handlers. */
export function getBillingSnapshot(): PrefactureDto[] {
  return prefactures.map(toDto);
}

function isValidAdjustment(value: unknown): value is BillingAdjustmentDto {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<BillingAdjustmentDto>;
  return (
    typeof v.amount === "number" &&
    Number.isInteger(v.amount) &&
    v.amount !== 0 &&
    typeof v.reason === "string" &&
    REASONS.includes(v.reason as AdjustmentReason) &&
    (v.note === undefined || typeof v.note === "string")
  );
}

/** Un campo de imputación: texto, o `null` si no llegó. Nunca cadena vacía. */
function imputationField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function readImputation(value: unknown): ImputationDto {
  const v = (value ?? {}) as Partial<Record<keyof ImputationDto, unknown>>;
  return {
    costObject: imputationField(v.costObject),
    concept: imputationField(v.concept),
    accountName: imputationField(v.accountName),
    accountNumber: imputationField(v.accountNumber),
    costCenter: imputationField(v.costCenter),
    purchaseOrder: imputationField(v.purchaseOrder),
    paymentAccount: imputationField(v.paymentAccount),
  };
}

const notFound = () =>
  HttpResponse.json({ message: "Prefactura no encontrada" }, { status: 404 });
const bad = (message: string) =>
  HttpResponse.json({ message }, { status: 400 });
const replace = (updated: StoredPrefacture) => {
  prefactures = prefactures.map((p) => (p.id === updated.id ? updated : p));
  return HttpResponse.json(toDto(updated));
};
/**
 * Aprobada u objetada: no se toca. La objetada está en manos del proveedor
 * hasta que llegue la corregida. Devuelve el motivo, o null si se puede editar.
 */
const editBlocked = (p: StoredPrefacture): string | null =>
  p.status === "Approved"
    ? "La prefactura está aprobada: no se puede ajustar"
    : p.status === "Objected"
      ? "La prefactura está objetada: espera la corregida del proveedor"
      : null;

/** Trabajar una prefactura recién llegada la pone en revisión. */
const working = (p: StoredPrefacture): BillingStatus =>
  p.status === "Received" ? "InReview" : p.status;

export const billingHandlers = [
  http.get(BASE, ({ request }) => {
    const period = new URL(request.url).searchParams.get("period") ?? "";
    if (!PERIOD_RE.test(period)) return bad("Período inválido");
    // Una fila por persona externa: la que ya tiene registro del período, y
    // la que todavía no, en blanco.
    const rows: PrefactureDto[] = externals(peopleFor(request)).map((e) => {
      const found = prefactures.find(
        (p) => p.personId === e.personId && p.period === period
      );
      // Sin registro, el esperado no está generado: es un estado distinto de
      // "generado y esperando la prefactura", y la pantalla los separa.
      return toDto(found ?? { ...blank(e, period), status: "None" });
    });
    return HttpResponse.json(rows);
  }),

  http.post(`${BASE}/generate`, async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      period?: string;
    } | null;
    const period = body?.period ?? "";
    if (!PERIOD_RE.test(period)) return bad("Período inválido");
    // Idempotente: los registros que ya existen no se tocan.
    const created = externals(peopleFor(request))
      .filter(
        (e) =>
          !prefactures.some(
            (p) => p.personId === e.personId && p.period === period
          )
      )
      .map((e) => blank(e, period));
    prefactures = [...prefactures, ...created];
    return HttpResponse.json(created.map(toDto), { status: 201 });
  }),

  http.get(`${BASE}/:id`, ({ params }) => {
    const found = prefactures.find((p) => p.id === params.id);
    return found ? HttpResponse.json(toDto(found)) : notFound();
  }),

  http.post(`${BASE}/:id/prefacture`, async ({ params, request }) => {
    const current = prefactures.find((p) => p.id === params.id);
    if (!current) return notFound();
    if (current.status === "Approved") {
      return bad("La prefactura ya está aprobada");
    }
    // Una sola prefactura por persona y período — salvo la corregida de una
    // objetada, que es justamente el camino de vuelta.
    if (current.document !== null && current.status !== "Objected") {
      return bad(
        "Esta persona ya tiene una prefactura registrada en el período"
      );
    }
    const body = (await request
      .json()
      .catch(() => null)) as Partial<PrefactureDocumentDto> | null;
    if (
      !body ||
      typeof body.number !== "string" ||
      body.number.trim() === "" ||
      typeof body.receivedAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.receivedAt) ||
      typeof body.amount !== "number" ||
      !Number.isFinite(body.amount) ||
      body.amount <= 0
    ) {
      return bad("Datos de la prefactura inválidos");
    }
    // La diferencia se calcula contra un esperado en pesos: comparar otra
    // moneda sin una tasa trazada produce una cifra que parece válida y no lo
    // es. Se rechaza antes de guardar, no después de calcular mal.
    if (body.currency !== undefined && body.currency !== "COP") {
      return bad(
        "Por ahora sólo se comparan prefacturas en COP: el esperado está en pesos"
      );
    }
    const amount = Math.round(body.amount);
    return replace({
      ...current,
      status: "Received",
      document: {
        number: body.number.trim(),
        receivedAt: body.receivedAt,
        amount,
        currency: "COP",
        imputation: readImputation(body.imputation),
      },
      prefactured: amount,
    });
  }),

  http.put(`${BASE}/:id/prefactured`, async ({ params, request }) => {
    const current = prefactures.find((p) => p.id === params.id);
    if (!current) return notFound();
    const blocked = editBlocked(current);
    if (blocked) return bad(blocked);
    if (current.document === null) return bad("Todavía no llegó la prefactura");
    const body = (await request.json().catch(() => null)) as {
      prefactured?: number;
    } | null;
    if (
      typeof body?.prefactured !== "number" ||
      !Number.isFinite(body.prefactured) ||
      body.prefactured < 0
    ) {
      return bad("Valor prefacturado inválido");
    }
    return replace({
      ...current,
      status: working(current),
      prefactured: Math.round(body.prefactured),
    });
  }),

  http.put(`${BASE}/:id/adjustment`, async ({ params, request }) => {
    const current = prefactures.find((p) => p.id === params.id);
    if (!current) return notFound();
    const blocked = editBlocked(current);
    if (blocked) return bad(blocked);
    const body = await request.json().catch(() => null);
    if (!isValidAdjustment(body)) return bad("Ajuste inválido");
    return replace({
      ...current,
      status: working(current),
      adjustment: {
        amount: body.amount,
        reason: body.reason,
        note: body.note ?? "",
      },
    });
  }),

  http.delete(`${BASE}/:id/adjustment`, ({ params }) => {
    const current = prefactures.find((p) => p.id === params.id);
    if (!current) return notFound();
    const blocked = editBlocked(current);
    if (blocked) return bad(blocked);
    return replace({ ...current, status: working(current), adjustment: null });
  }),

  http.put(`${BASE}/:id/status`, async ({ params, request }) => {
    const current = prefactures.find((p) => p.id === params.id);
    if (!current) return notFound();
    const body = (await request.json().catch(() => null)) as {
      status?: BillingStatus;
      note?: string;
      reason?: string;
    } | null;
    const reviewable =
      current.status === "Received" || current.status === "InReview";

    if (body?.status === "Approved") {
      if (!reviewable) return bad("Transición de estado inválida");
      const dto = toDto(current);
      const note = typeof body.note === "string" ? body.note.trim() : "";
      // Aceptar una diferencia es una decisión: tiene que quedar justificada.
      if ((dto.difference ?? 0) !== 0 && note === "") {
        return bad(
          "La prefactura tiene diferencia contra lo esperado: hace falta una nota que justifique aprobarla"
        );
      }
      return replace({
        ...current,
        status: "Approved",
        approvalNote: note === "" ? null : note,
        approvedAtUtc: new Date().toISOString(),
        // Congela el descuento con el que se aprobó.
        frozenDiscount: deriveDiscount(
          current.personId,
          current.period,
          current.monthlyCost
        ),
      });
    }

    if (body?.status === "Objected") {
      if (!reviewable) return bad("Transición de estado inválida");
      const reason = typeof body.reason === "string" ? body.reason.trim() : "";
      if (reason === "") return bad("El motivo de la objeción es obligatorio");
      return replace({
        ...current,
        status: "Objected",
        objection: { reason, objectedAtUtc: new Date().toISOString() },
      });
    }

    return bad("Transición de estado inválida");
  }),
];
