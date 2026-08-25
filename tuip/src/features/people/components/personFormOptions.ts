import type { Person } from "../adapters/PersonAdapter";
import type {
  PersonRole,
  TechnicalLeadOption,
} from "../services/personService";

/**
 * Las decisiones del formulario que no dependen de haberlo montado.
 *
 * Viven acá y no dentro del drawer porque el drawer no se puede montar en
 * jsdom en este repo (ver la nota de PeopleContainer.test): con la lógica
 * afuera, lo que decide qué se ofrece y cuándo se avisa se prueba de verdad,
 * y en el navegador queda por verificar sólo que se vea.
 */

/**
 * Quiénes se ofrecen como líder técnico: las personas con ese rol, menos la
 * que se está editando. Nadie es su propio líder técnico, y ofrecérselo
 * invita a un dato que no significa nada.
 */
export function technicalLeadOptions(
  leads: TechnicalLeadOption[],
  editingPersonId?: string
): TechnicalLeadOption[] {
  return leads.filter((lead) => lead.id !== editingPersonId);
}

/**
 * Si hay que avisar antes de guardar: se le está quitando el rol de Líder
 * Técnico a alguien que figura como líder técnico de otras personas, y esas
 * referencias van a quedar sin nadie.
 *
 * Sólo en la edición: en un alta no hay nadie que la tenga como líder.
 */
export function losesTechnicalLeadReferences(
  person: Person | undefined,
  role: PersonRole | ""
): boolean {
  if (!person) return false;
  return (
    person.role === "TechnicalLead" &&
    role !== "TechnicalLead" &&
    person.technicalLeadOfCount > 0
  );
}
