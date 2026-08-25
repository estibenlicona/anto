import { useMemo, useState } from "react";
import {
  Checkbox,
  Icon,
  PaginationBar,
  SearchField,
  SegmentedControl,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";

export const meta = {
  title: "Integración completa",
  description:
    "SearchField + densidad sueltos sobre la página (ya no dentro de TableToolbar) + TableHead ordenable + selección con Checkbox + PaginationBar, todo controlado por el consumidor.",
  caption: "Table sigue sin conocer la forma de los datos: orden, filtro, selección y paginación viven acá",
};

const ROWS = [
  { id: "julian", nombre: "Julián Pérez", celula: "Backend Platform", fte: 1.0 },
  { id: "maria", nombre: "María González", celula: "Backend Platform", fte: 1.1 },
  { id: "laura", nombre: "Laura Ruiz", celula: "Canales Digitales", fte: 0.8 },
  { id: "carlos", nombre: "Carlos Mora", celula: "Core Bancario", fte: 1.0 },
  { id: "sofia", nombre: "Sofía Vargas", celula: "Seguridad", fte: 0.9 },
];

const DENSITY_OPTIONS = [
  { value: "comfortable", label: "Cómoda", icon: <Icon name="density-comfortable" size={16} /> },
  { value: "compact", label: "Compacta", icon: <Icon name="density-compact" size={16} /> },
];

const PAGE_SIZE_OPTIONS = [3, 5, 10];

export default function Example() {
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const filtered = useMemo(
    () => ROWS.filter((row) => row.nombre.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) =>
      sortDirection === "asc" ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre),
    );
    return copy;
  }, [filtered, sortDirection]);

  const pageCount = Math.max(Math.ceil(sorted.length / pageSize), 1);
  const currentPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((row) => selected.includes(row.id));
  const someOnPageSelected = pageRows.some((row) => selected.includes(row.id)) && !allOnPageSelected;
  const selectedInView = sorted.filter((row) => selected.includes(row.id));

  return (
    <div className="w-full">
      {/* Sueltos sobre el fondo de la página, ya no dentro de un TableToolbar con caja. */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <SearchField
          placeholder="Buscar capacidad…"
          className="min-w-[200px]"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <span className="text-body-sm text-neutral-subtle">
          {selectedInView.length} seleccionada{selectedInView.length === 1 ? "" : "s"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-body-sm text-neutral-subtle">Densidad</span>
          <SegmentedControl
            label="Densidad"
            options={DENSITY_OPTIONS}
            value={density}
            onValueChange={(value) => setDensity(value as "comfortable" | "compact")}
          />
        </div>
      </div>

      <Table density={density}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                aria-label="Seleccionar todas"
                checked={allOnPageSelected}
                indeterminate={someOnPageSelected}
                onChange={(event) => {
                  const pageIds = pageRows.map((row) => row.id);
                  setSelected((current) =>
                    event.target.checked
                      ? Array.from(new Set([...current, ...pageIds]))
                      : current.filter((id) => !pageIds.includes(id)),
                  );
                }}
              />
            </TableHead>
            <TableHead
              sortDirection={sortDirection}
              onSort={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
            >
              Capacidad
            </TableHead>
            <TableHead>Célula</TableHead>
            <TableHead align="right">FTE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Checkbox
                  aria-label={`Seleccionar ${row.nombre}`}
                  checked={selected.includes(row.id)}
                  onChange={(event) =>
                    setSelected((current) =>
                      event.target.checked
                        ? [...current, row.id]
                        : current.filter((id) => id !== row.id),
                    )
                  }
                />
              </TableCell>
              <TableCell>{row.nombre}</TableCell>
              <TableCell>{row.celula}</TableCell>
              <TableCell align="right">{row.fte.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationBar
        className="mt-3"
        page={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
        total={sorted.length}
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
