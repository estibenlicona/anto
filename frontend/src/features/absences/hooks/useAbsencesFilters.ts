import { useMemo, useState } from "react";
import type { Absence } from "../adapters/AbsenceAdapter";
import type { AbsenceStatus, AbsenceType } from "../services/absenceService";

const DEFAULT_PAGE_SIZE = 10;

/**
 * Sin acentos y en minúsculas: los nombres del chapter llevan tildes
 * ("María", "López") y escribirlas es justo lo que nadie hace al buscar.
 */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Acota y pagina en memoria las ausencias del mes visible. El endpoint del mes
 * devuelve el mes entero de una, así que no hay nada que volver a pedir: se
 * filtra sobre lo que ya está. Devuelve la misma forma que `PeopleList` espera
 * de `usePeople`, para que la tabla no sepa de dónde salen sus filas — si algún
 * día el endpoint acepta parámetros, se sustituye este hook y la tabla no cambia.
 */
export function useAbsencesFilters(items: Absence[], monthKey: string) {
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<AbsenceType[]>([]);
  const [statuses, setStatuses] = useState<AbsenceStatus[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  // El mes es el eje de la pantalla: arrastrar un filtro a un mes que no tiene
  // nada de eso daría un "Sin resultados" que se lee como un error. El reinicio
  // se hace durante el render comparando con el mes anterior —no en un efecto—
  // para que la tabla nunca llegue a pintarse una vez con los filtros del mes
  // que se acaba de dejar.
  const [renderedMonth, setRenderedMonth] = useState(monthKey);
  if (renderedMonth !== monthKey) {
    setRenderedMonth(monthKey);
    setSearch("");
    setTypes([]);
    setStatuses([]);
    setPage(1);
    setPageSizeState(DEFAULT_PAGE_SIZE);
  }

  const filtered = useMemo(() => {
    const needle = normalize(search.trim());
    return items.filter((absence) => {
      if (needle && !normalize(absence.personName).includes(needle)) {
        return false;
      }
      if (types.length > 0 && !types.includes(absence.type)) return false;
      if (statuses.length > 0 && !statuses.includes(absence.status)) {
        return false;
      }
      return true;
    });
  }, [items, search, types, statuses]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // La página se acota al recortar el resultado en vez de guardarse corregida:
  // aprobar una ausencia puede vaciar la última página sin pasar por un setter.
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  // Todo lo que cambia el conjunto vuelve a la página 1: filtrar desde la
  // página 3 dejaría la tabla vacía con el paginador lleno.
  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const onTypesChange = (values: AbsenceType[]) => {
    setTypes(values);
    setPage(1);
  };
  const onStatusesChange = (values: AbsenceStatus[]) => {
    setStatuses(values);
    setPage(1);
  };
  const onPageSizeChange = (value: number) => {
    setPageSizeState(value);
    setPage(1);
  };

  return {
    visible,
    total,
    page: safePage,
    pageSize,
    totalPages,
    onPageChange: setPage,
    onPageSizeChange,
    search,
    onSearchChange,
    types,
    onTypesChange,
    statuses,
    onStatusesChange,
    /** Hay algo escrito o marcado: distingue "sin resultados" de "mes vacío". */
    hasActiveFilter:
      search.trim().length > 0 || types.length > 0 || statuses.length > 0,
  };
}
