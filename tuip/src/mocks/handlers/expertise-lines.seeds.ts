/**
 * Semillas de las líneas de expertise y del reparto inicial de la gente.
 *
 * El reparto se declara **por nombre de persona** y no por id, igual que
 * `EXTERNAL_PROVIDERS` y `seedStacks` en people.handlers: los ids sembrados se
 * construyen con un truco de letras repetidas y escribirlos acá otra vez sería
 * copiar ese truco a un segundo lugar. El handler los resuelve contra el
 * snapshot de personas al sembrar.
 *
 * El reparto deja gente fuera a propósito. Los roles que no son de una
 * disciplina técnica (UX, PO, Scrum Master) quedan sin línea, que es el estado
 * con el que la pantalla arranca en la vida real: el maestro existe antes de
 * que alguien termine de repartir.
 */

export type ExpertiseLineStatus = "Active" | "Archived";

export interface StoredExpertiseLine {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: ExpertiseLineStatus;
  /** Nombre de la persona; el handler lo resuelve a id al sembrar. */
  leadName: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

const now = new Date().toISOString();

const line = (
  id: string,
  name: string,
  code: string,
  description: string | null,
  leadName: string | null,
  status: ExpertiseLineStatus = "Active"
): StoredExpertiseLine => ({
  id,
  name,
  code,
  description,
  status,
  leadName,
  createdAtUtc: now,
  updatedAtUtc: now,
});

export const initialLineSeeds: StoredExpertiseLine[] = [
  line(
    "e1111111-1111-1111-1111-111111111111",
    "Backend",
    "BE",
    "Servicios, APIs y la arquitectura que las sostiene.",
    "María González"
  ),
  line(
    "e2222222-2222-2222-2222-222222222222",
    "QA",
    "QA",
    "Estrategia de pruebas y automatización.",
    "Laura Ruiz"
  ),
  // Activa y sin lead a propósito: es el estado que la pantalla marca como
  // incompleto, y sin una así no se ve nunca esa marca.
  line(
    "e3333333-3333-3333-3333-333333333333",
    "Frontend",
    "FE",
    "Web y móvil de cara al cliente.",
    null
  ),
  line(
    "e4444444-4444-4444-4444-444444444444",
    "Datos",
    "DAT",
    "Pipelines, modelo analítico y gobierno del dato.",
    "Paula Ramírez"
  ),
  line(
    "e5555555-5555-5555-5555-555555555555",
    "Infraestructura y Seguridad",
    "INF",
    "Plataforma, despliegue y seguridad de las aplicaciones.",
    "Sebastián Cárdenas"
  ),
  // Archivada y vacía: la línea que el chapter dejó de operar. Sirve para ver
  // que se sigue mostrando, que no se ofrece al asignar, y que su código no se
  // puede reutilizar.
  line(
    "e6666666-6666-6666-6666-666666666666",
    "AS-400",
    "AS400",
    "Mantenimiento del core legado.",
    null,
    "Archived"
  ),
];

/**
 * A qué línea pertenece cada persona sembrada, por nombre. Quien no aparece
 * acá arranca sin línea: Valentina Ospina, Camila Restrepo, Sofía Herrera y
 * Lucía Arango.
 */
export const initialMembershipByName: Record<string, string> = {
  // Backend
  "María González": "e1111111-1111-1111-1111-111111111111",
  "Carlos López": "e1111111-1111-1111-1111-111111111111",
  "Diego Salazar": "e1111111-1111-1111-1111-111111111111",
  "Daniela Castaño": "e1111111-1111-1111-1111-111111111111",
  "Tomás Giraldo": "e1111111-1111-1111-1111-111111111111",
  // QA
  "Laura Ruiz": "e2222222-2222-2222-2222-222222222222",
  "Julián Peña": "e2222222-2222-2222-2222-222222222222",
  // Frontend
  "Andrés Martínez": "e3333333-3333-3333-3333-333333333333",
  "Isabella Moreno": "e3333333-3333-3333-3333-333333333333",
  "Nicolás Betancur": "e3333333-3333-3333-3333-333333333333",
  // Datos
  "Paula Ramírez": "e4444444-4444-4444-4444-444444444444",
  "Mateo Vargas": "e4444444-4444-4444-4444-444444444444",
  // Infraestructura y Seguridad
  "Sebastián Cárdenas": "e5555555-5555-5555-5555-555555555555",
  "Emilio Naranjo": "e5555555-5555-5555-5555-555555555555",
};
