import { useEffect, useState } from "react";
import { personService } from "../services/personService";

/**
 * La línea de expertise de una persona, para mostrarla sin editarla.
 *
 * Se pide aparte y no viaja en el listado porque el dueño del dato es el
 * maestro de líneas: preguntarle a él es lo que hace que mover a alguien de
 * línea se vea acá sin tocar a la persona.
 *
 * El estado guarda de **quién** es la respuesta, y `loading` sale de comparar
 * eso con lo que se está pidiendo. Es más largo que un `setLoading(true)` al
 * entrar al efecto, y evita justamente eso: escribir estado en el cuerpo del
 * efecto encadena renders, y además dejaba ver un instante la línea de la
 * persona anterior al abrir otra.
 */
export const usePersonExpertiseLine = (personId: string | undefined) => {
  const [resuelto, setResuelto] = useState<{
    personId: string;
    name: string | null;
  } | null>(null);

  useEffect(() => {
    if (!personId) return;
    let cancelled = false;
    personService
      .getExpertiseLine(personId)
      .then((line) => {
        if (!cancelled) setResuelto({ personId, name: line?.name ?? null });
      })
      .catch(() => {
        // Sin línea y con error se ven igual en el formulario —"Sin línea
        // asignada"— porque en los dos casos lo que corresponde es ir a
        // Líneas. El detalle del error no le sirve a quien está editando.
        if (!cancelled) setResuelto({ personId, name: null });
      });
    return () => {
      cancelled = true;
    };
  }, [personId]);

  const respondido = personId !== undefined && resuelto?.personId === personId;
  return {
    name: respondido ? resuelto.name : null,
    loading: personId !== undefined && !respondido,
  };
};
