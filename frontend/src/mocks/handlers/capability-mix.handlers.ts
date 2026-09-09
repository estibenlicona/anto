import { http, HttpResponse } from "msw";
import type {
  CapabilityMix,
  CapabilityMixRow,
} from "@features/admin-shell/services/capabilityMixService";

const CAPABILITY_MIX_URL = "/admin/capability-mix";

/**
 * Las capacidades que una iniciativa pide, por talla.
 *
 * Son seis y no tres porque tres —backend, QA y arquitecto— dejaban fuera a
 * la mitad de la gente que las células tienen de verdad: una célula de datos
 * o una de canales aparecía descubierta al 100 % contra una demanda que nunca
 * nombraba su perfil. Los seis nombres son cargos que existen en el mock de
 * personas, así que la comparación entre lo que la iniciativa pide y lo que
 * la célula tiene se puede hacer perfil por perfil.
 *
 * Los totales por talla no cambian —1, 3, 5, 8 y 13 personas— para no mover
 * la lectura de las bandas de talla al repartirlos entre más perfiles.
 */
const defaultMix: CapabilityMix = [
  {
    id: "backend-dev",
    capacidad: "Backend Dev",
    porTalla: { XS: 1, S: 2, M: 2, L: 3, XL: 4 },
  },
  {
    id: "frontend-dev",
    capacidad: "Frontend Dev",
    porTalla: { XS: 0, S: 0, M: 1, L: 1, XL: 2 },
  },
  {
    id: "qa-engineer",
    capacidad: "QA Engineer",
    porTalla: { XS: 0, S: 1, M: 1, L: 2, XL: 3 },
  },
  {
    id: "arquitecto",
    capacidad: "Arquitecto",
    porTalla: { XS: 0, S: 0, M: 1, L: 1, XL: 2 },
  },
  {
    id: "devops-engineer",
    capacidad: "DevOps Engineer",
    porTalla: { XS: 0, S: 0, M: 0, L: 1, XL: 1 },
  },
  {
    id: "data-engineer",
    capacidad: "Data Engineer",
    porTalla: { XS: 0, S: 0, M: 0, L: 0, XL: 1 },
  },
];

function clone(mix: CapabilityMix): CapabilityMix {
  return mix.map((row) => ({ ...row, porTalla: { ...row.porTalla } }));
}

let capabilityMix: CapabilityMix = clone(defaultMix);

/** Lectura de sólo consulta para otros handlers (el modelo de evaluación se arma desde acá). */
export function getCapabilityMixSnapshot(): CapabilityMix {
  return clone(capabilityMix);
}

/** Reinicia el estado en memoria del mock — llamar explícitamente en los tests que ejercitan el guardado. */
export function resetCapabilityMixMock() {
  capabilityMix = clone(defaultMix);
}

function isValidRow(value: unknown): value is CapabilityMixRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<CapabilityMixRow>;
  if (typeof row.id !== "string" || row.id.length === 0) return false;
  if (typeof row.capacidad !== "string" || row.capacidad.trim().length === 0)
    return false;
  if (!row.porTalla || typeof row.porTalla !== "object") return false;
  return Object.values(row.porTalla).every(
    (amount) =>
      typeof amount === "number" && Number.isInteger(amount) && amount >= 0
  );
}

/**
 * El hook ya valida nombres al editar, pero acá se valida igual: este handler
 * recibe un cuerpo arbitrario por HTTP, donde nada garantiza de dónde vino.
 */
function isValidMix(value: unknown): value is CapabilityMix {
  if (!Array.isArray(value)) return false;
  if (!value.every(isValidRow)) return false;
  const names = value.map((row) => row.capacidad.trim().toLocaleLowerCase());
  return new Set(names).size === names.length;
}

export const capabilityMixHandlers = [
  http.get(CAPABILITY_MIX_URL, () => {
    return HttpResponse.json(capabilityMix);
  }),

  http.put(CAPABILITY_MIX_URL, async ({ request }) => {
    const body = await request.json().catch(() => null);
    if (!isValidMix(body)) {
      return HttpResponse.json(
        { message: "Mix de capacidades inválido" },
        { status: 400 }
      );
    }
    capabilityMix = clone(body);
    return HttpResponse.json(capabilityMix);
  }),
];
