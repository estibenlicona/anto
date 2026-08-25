import type { CategoricalColor } from "@tuya-ui/components";

/**
 * El color de los dos tramos del esfuerzo, BAU y Transformación.
 *
 * Van en el vocabulario **categórico** y no en el de acento. El acento
 * distingue los pasos de una escala ordinal —primero, segundo, tercero— y
 * estos dos no son pasos de nada: son dos categorías, y ninguna va antes que
 * la otra. Usar acento los hacía tomar prestados `sky` y `violet`, que son
 * exactamente los tonos con los que la pantalla de Personas dibuja la escala
 * de seniority; en pantalla se leían como si fueran esa escala.
 *
 * `green` y `purple` son los dos que quedan bien separados entre sí y de todo
 * lo demás: azul queda fuera por parecerse otra vez a seniority, rojo por
 * leerse como peligro, y gris porque es el color de la pista vacía de la
 * propia barra.
 *
 * Vive acá y no dentro de un componente porque lo consume media docena larga
 * de pantallas —el listado y el detalle de Células, la Torre de Control, el
 * detalle de Persona— y el color de un tramo tiene que ser el mismo en todas.
 * Antes vivía dentro de `SquadTeamStatsCards`, y esos consumidores lo
 * importaban de ahí.
 */
export const MIX_COLORS: Record<"bau" | "transformation", CategoricalColor> = {
  bau: "green",
  transformation: "purple",
};
