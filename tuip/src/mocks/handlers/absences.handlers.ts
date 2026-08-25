import { http, HttpResponse } from "msw";
import type {
  AbsenceDto,
  AbsenceStatus,
  AbsenceType,
  CreateAbsenceRequest,
} from "@features/absences/services/absenceService";
import {
  clampRange,
  isBusinessDay,
  computeSquadImpacts,
  countBusinessDays,
  formatIsoDate,
  monthBounds,
  parseIsoDate,
} from "@features/absences/services/businessDays";
// Tercera excepción al "cada mock vive solo": los impactos se derivan de las
// personas (FTE disponible, proveedor) y de sus asignaciones (dedicación por
// célula), no se digitan. Lectura en un solo sentido, como backlog.handlers.
import { getCompaniesSnapshot, getPeopleSnapshot } from "./people.handlers";
import { getAllocationsSnapshot } from "./allocations.handlers";
import { vistaDe } from "./scope";

/** Lo que el mock persiste: la ausencia en sí. Todo lo demás se deriva al responder. */
interface StoredAbsence {
  id: string;
  personId: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  status: AbsenceStatus;
  rejectReason: string | null;
}

// ── Semillas relativas al mes corriente ─────────────────────────────────────
// La pantalla abre en el mes actual: semillas con fechas fijas se verían
// vacías en cuanto pasara el mes. Se calculan al cargar el módulo.

const seedBase = new Date();
const SEED_YEAR = seedBase.getFullYear();
const SEED_MONTH = seedBase.getMonth();

/** n-ésimo día de semana del mes corriente (weekday: 1 = lunes … 5 = viernes). */
function nthWeekday(n: number, weekday: number): Date {
  const first = new Date(SEED_YEAR, SEED_MONTH, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(SEED_YEAR, SEED_MONTH, 1 + offset + (n - 1) * 7);
}

/**
 * Último día hábil del mes corriente — arranque de la ausencia que cruza al
 * mes siguiente: está a lo sumo a 2 días del fin de mes, así que +4 días
 * calendario cae siempre en el mes que viene.
 */
function lastBusinessDayOfMonth(): Date {
  const cursor = new Date(SEED_YEAR, SEED_MONTH + 1, 0);
  while (!isBusinessDay(cursor)) cursor.setDate(cursor.getDate() - 1);
  return cursor;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

const seed = (
  n: number,
  personId: string,
  type: AbsenceType,
  start: Date,
  end: Date,
  status: AbsenceStatus,
  rejectReason: string | null = null
): StoredAbsence => ({
  id: `ab${String(n).repeat(6)}-${String(n).repeat(4)}-${String(n).repeat(4)}-${String(n).repeat(4)}-${String(n).repeat(12)}`,
  personId,
  type,
  startDate: formatIsoDate(start),
  endDate: formatIsoDate(end),
  status,
  rejectReason,
});

// Personas de people.handlers: María (planta, Backend 80%), Carlos (GFT,
// Backend 100%, 0.8 FTE), Paula (planta, Datos 60%), Laura (planta, Canales
// 100%), Andrés (planta, Backend 50%). Tres tipos, tres estados, y la de
// Carlos cruza el fin de mes (último día hábil + 4 días calendario).
const initialAbsences: StoredAbsence[] = [
  seed(
    1,
    "p1111111-1111-1111-1111-111111111111",
    "Vacation",
    nthWeekday(2, 1),
    addDays(nthWeekday(2, 1), 2),
    "Approved"
  ),
  seed(
    2,
    "p3333333-3333-3333-3333-333333333333",
    "SickLeave",
    lastBusinessDayOfMonth(),
    addDays(lastBusinessDayOfMonth(), 4),
    "Approved"
  ),
  seed(
    3,
    "pbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    "Leave",
    nthWeekday(3, 3),
    nthWeekday(3, 3),
    "Requested"
  ),
  seed(
    4,
    "p2222222-2222-2222-2222-222222222222",
    "Vacation",
    nthWeekday(4, 1),
    addDays(nthWeekday(4, 1), 1),
    "Requested"
  ),
  seed(
    5,
    "paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "Leave",
    nthWeekday(2, 3),
    addDays(nthWeekday(2, 3), 1),
    "Rejected",
    "Coincide con el cierre del sprint; movámoslo una semana"
  ),
];

let absences: StoredAbsence[] = initialAbsences.map((a) => ({ ...a }));

/** Reinicia el estado en memoria del mock — llamar explícitamente en los tests que ejercitan mutaciones. */
export function resetAbsencesMock() {
  absences = initialAbsences.map((a) => ({ ...a }));
}

/** Una ausencia aprobada vista desde la facturación: sólo lo que el descuento necesita. */
export interface ApprovedAbsenceInPeriod {
  personId: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  /** Días hábiles de esta ausencia que caen dentro del mes pedido. */
  businessDaysInMonth: number;
}

/**
 * Ausencias **aprobadas** que tocan un período, con sus días hábiles dentro
 * del mes y los días hábiles del mes. Es la fuente del descuento por ausencias
 * de la facturación: la cuenta de días vive acá y no se duplica del otro lado
 * (así una misma ausencia no se lee distinto en las dos pantallas).
 *
 * Las solicitadas y las rechazadas quedan fuera a propósito: sólo lo aprobado
 * descuenta.
 */
export function getApprovedAbsencesSnapshot(month: string): {
  monthBusinessDays: number;
  items: ApprovedAbsenceInPeriod[];
} {
  const bounds = monthBounds(month);
  if (!bounds) return { monthBusinessDays: 0, items: [] };
  const monthBusinessDays = countBusinessDays(bounds.start, bounds.end);
  const items = absences
    .filter((a) => a.status === "Approved")
    .map((a) => {
      const inMonth = clampRange(
        parseIsoDate(a.startDate)!,
        parseIsoDate(a.endDate)!,
        bounds.start,
        bounds.end
      );
      return {
        personId: a.personId,
        type: a.type,
        startDate: a.startDate,
        endDate: a.endDate,
        businessDaysInMonth: inMonth
          ? countBusinessDays(inMonth.start, inMonth.end)
          : 0,
      };
    })
    .filter((a) => a.businessDaysInMonth > 0);
  return { monthBusinessDays, items };
}

// ── Derivaciones ────────────────────────────────────────────────────────────

function monthKeyOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** Completa una ausencia con la persona, el proveedor y los impactos del mes pedido. */
function enrich(absence: StoredAbsence, month: string): AbsenceDto {
  const person = getPeopleSnapshot().find((p) => p.id === absence.personId);
  const providerName = person?.providerId
    ? (getCompaniesSnapshot().find((c) => c.id === person.providerId)?.name ??
      null)
    : null;
  const start = parseIsoDate(absence.startDate)!;
  const end = parseIsoDate(absence.endDate)!;
  const bounds = monthBounds(month)!;
  const monthBusinessDays = countBusinessDays(bounds.start, bounds.end);
  const inMonth = clampRange(start, end, bounds.start, bounds.end);
  const businessDaysInMonth = inMonth
    ? countBusinessDays(inMonth.start, inMonth.end)
    : 0;
  const shares = getAllocationsSnapshot()
    .filter((a) => a.personId === absence.personId)
    .map((a) => ({
      squadId: a.squadId,
      squadName: a.squadName,
      dedicationPercentage: a.dedicationPercentage,
    }));
  return {
    ...absence,
    personName: person?.name ?? "Persona",
    providerName,
    businessDays: countBusinessDays(start, end),
    businessDaysInMonth,
    squadImpacts: computeSquadImpacts(
      businessDaysInMonth,
      monthBusinessDays,
      person?.availableFte ?? 1,
      shares
    ),
  };
}

function isValidCreateRequest(value: unknown): value is CreateAbsenceRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<CreateAbsenceRequest>;
  return (
    typeof v.personId === "string" &&
    v.personId.length > 0 &&
    (v.type === "Vacation" || v.type === "Leave" || v.type === "SickLeave") &&
    typeof v.startDate === "string" &&
    typeof v.endDate === "string"
  );
}

// ── Rutas ───────────────────────────────────────────────────────────────────

export const absencesHandlers = [
  http.get("/absences", ({ request }) => {
    const month = new URL(request.url).searchParams.get("month");
    const bounds = month ? monthBounds(month) : null;
    if (!month || !bounds) {
      return HttpResponse.json(
        { message: "Mes inválido: se espera month=YYYY-MM" },
        { status: 400 }
      );
    }
    // Sólo las ausencias de la gente a cargo de quien pide: el calendario y
    // la cola de "por aprobar" son su trabajo, no el de todo el sistema.
    const { ve } = vistaDe(request);
    const items = absences
      .filter((a) => ve(a.personId))
      .filter((a) => {
        const start = parseIsoDate(a.startDate)!;
        const end = parseIsoDate(a.endDate)!;
        return clampRange(start, end, bounds.start, bounds.end) !== null;
      })
      .map((a) => enrich(a, month))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    return HttpResponse.json({
      month,
      monthBusinessDays: countBusinessDays(bounds.start, bounds.end),
      items,
    });
  }),

  http.post("/absences", async ({ request }) => {
    const body = await request.json().catch(() => null);
    if (!isValidCreateRequest(body)) {
      return HttpResponse.json(
        { message: "Datos de ausencia inválidos" },
        { status: 400 }
      );
    }
    const start = parseIsoDate(body.startDate);
    const end = parseIsoDate(body.endDate);
    if (!start || !end || end < start) {
      return HttpResponse.json(
        { message: "El rango de fechas es inválido" },
        { status: 400 }
      );
    }
    if (!getPeopleSnapshot().some((p) => p.id === body.personId)) {
      return HttpResponse.json(
        { message: "La persona no existe" },
        { status: 400 }
      );
    }
    // Solape sólo contra no-rechazadas: una rechazada no bloquea re-registrar
    // el mismo rango — es el camino de corrección elegido (design.md).
    const overlapping = absences.some((a) => {
      if (a.personId !== body.personId || a.status === "Rejected") return false;
      return (
        clampRange(
          parseIsoDate(a.startDate)!,
          parseIsoDate(a.endDate)!,
          start,
          end
        ) !== null
      );
    });
    if (overlapping) {
      return HttpResponse.json(
        {
          message:
            "La persona ya tiene una ausencia que se cruza con ese rango",
        },
        { status: 400 }
      );
    }
    const created: StoredAbsence = {
      id: crypto.randomUUID(),
      personId: body.personId,
      type: body.type,
      startDate: body.startDate,
      endDate: body.endDate,
      status: "Requested",
      rejectReason: null,
    };
    absences = [...absences, created];
    return HttpResponse.json(enrich(created, monthKeyOf(created.startDate)), {
      status: 201,
    });
  }),

  http.put("/absences/:id/status", async ({ request, params }) => {
    const existing = absences.find((a) => a.id === params.id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Ausencia no encontrada" },
        { status: 404 }
      );
    }
    // Aprobar sólo desde Solicitada; rechazar también desde Aprobada, que es
    // cómo se revierte una aprobación equivocada. Una Rechazada es terminal:
    // corregirla es registrar la ausencia de nuevo.
    if (existing.status === "Rejected") {
      return HttpResponse.json(
        { message: "Una ausencia rechazada no cambia de estado" },
        { status: 400 }
      );
    }
    const body = (await request.json().catch(() => null)) as {
      status?: string;
      reason?: string;
    } | null;
    let updated: StoredAbsence;
    if (body?.status === "Approved") {
      if (existing.status !== "Requested") {
        return HttpResponse.json(
          { message: "Sólo una ausencia solicitada puede aprobarse" },
          { status: 400 }
        );
      }
      updated = { ...existing, status: "Approved" };
    } else if (body?.status === "Rejected") {
      const reason = typeof body.reason === "string" ? body.reason.trim() : "";
      if (reason.length === 0) {
        return HttpResponse.json(
          { message: "El motivo del rechazo es obligatorio" },
          { status: 400 }
        );
      }
      updated = { ...existing, status: "Rejected", rejectReason: reason };
    } else {
      return HttpResponse.json({ message: "Estado inválido" }, { status: 400 });
    }
    absences = absences.map((a) => (a.id === updated.id ? updated : a));
    return HttpResponse.json(enrich(updated, monthKeyOf(updated.startDate)));
  }),
];
