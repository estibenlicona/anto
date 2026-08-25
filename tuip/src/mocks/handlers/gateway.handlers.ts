import { http, HttpResponse } from "msw";

/**
 * Imita la puerta de enlace que valida al llamador antes del backend.
 *
 * No imita al backend a propósito: la autenticación es externa al servicio por
 * diseño —lo declara su `ARCHITECTURE.md`, que ni siquiera admite la cabecera
 * `Authorization` en su CORS por defecto— así que en producción el 401 y el
 * 403 los devuelve APIM. En desarrollo no hay ninguna delante, y este handler
 * ocupa ese lugar.
 *
 * **Va apagado por defecto.** Encendido siempre, el 401 por falta de token
 * rompería toda la suite existente: los tests ejercitan servicios sin montar
 * sesión, que es lo correcto para lo que prueban. Quien quiera ejercitar la
 * puerta de enlace la enciende explícitamente.
 */

interface GatewayBehavior {
  /** Con `true`, una llamada sin cabecera `Authorization` recibe 401. */
  requireToken: boolean;
  /** Fuerza un código en toda llamada, por encima de `requireToken`. */
  forceStatus: 401 | 403 | null;
}

const DEFAULT_BEHAVIOR: GatewayBehavior = {
  requireToken: false,
  forceStatus: null,
};

let behavior: GatewayBehavior = { ...DEFAULT_BEHAVIOR };

export function setGatewayBehavior(next: Partial<GatewayBehavior>): void {
  behavior = { ...behavior, ...next };
}

/** Vuelve al comportamiento neutro. Para que una prueba no arrastre a otra. */
export function resetGatewayMock(): void {
  behavior = { ...DEFAULT_BEHAVIOR };
}

const UNAUTHORIZED = {
  status: 401,
  body: {
    error: "unauthorized",
    message: "La sesión no es válida o expiró.",
  },
};

const FORBIDDEN = {
  status: 403,
  body: {
    error: "forbidden",
    message: "La sesión no tiene permisos sobre este recurso.",
  },
};

/**
 * Distingue una llamada de datos de una petición del servidor de desarrollo.
 *
 * Es indispensable: en el navegador el Service Worker ve **todo** lo que pide
 * la página —módulos de Vite, CSS, la navegación misma— y no sólo las
 * llamadas al API. Sin este filtro, exigir token responde 401 a los módulos y
 * la aplicación deja de cargar por completo.
 *
 * El criterio principal es `destination`, que el navegador fija según para qué
 * pidió el recurso: `script` para un `import()`, `style` para una hoja,
 * `document` para navegar, y cadena vacía para `fetch`/XHR — que es lo que
 * usa el cliente HTTP. El chequeo de ruta queda como red por si algún entorno
 * no lo informa; en Node (`setupServer`) `destination` viene vacío siempre, y
 * ahí todo lo que se pide es efectivamente una llamada al API.
 */
const DEV_ASSET_PREFIXES = [
  "/src/",
  "/node_modules/",
  "/@vite",
  "/@react-refresh",
  "/@id/",
  "/@fs/",
];

function isDataRequest(request: Request): boolean {
  if (request.destination !== "") return false;
  const { pathname } = new URL(request.url);
  return !DEV_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export const gatewayHandlers = [
  // Primero en la lista: la puerta de enlace se evalúa antes que el servicio.
  // Devolver `undefined` deja pasar al siguiente handler, que es el caso
  // normal.
  http.all("*", ({ request }) => {
    if (!isDataRequest(request)) return undefined;
    if (behavior.forceStatus === 403) {
      return HttpResponse.json(FORBIDDEN.body, { status: FORBIDDEN.status });
    }
    if (behavior.forceStatus === 401) {
      return HttpResponse.json(UNAUTHORIZED.body, {
        status: UNAUTHORIZED.status,
      });
    }
    if (behavior.requireToken && !request.headers.get("Authorization")) {
      // Un token vencido llega acá como ausencia de cabecera: el simulador lo
      // representa así justamente para que este camino sea el mismo que en
      // producción, sin que el handler sepa que hubo un simulador.
      return HttpResponse.json(UNAUTHORIZED.body, {
        status: UNAUTHORIZED.status,
      });
    }
    return undefined;
  }),
];
