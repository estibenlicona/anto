import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  FilterButton,
  Icon,
  Link,
  Menu,
  MenuItem,
  MenuSeparator,
  PaginationBar,
  SearchField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import { TableStatusRow } from "@shared/components/TableStatusRow";
import type { BillingRow } from "../adapters/BillingAdapter";

export const billingPath = (id: string) => `/app/lead/facturacion/${id}`;

export interface BillingListProps {
  rows: BillingRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Texto de búsqueda (persona, proveedor o célula/CoE). */
  search: string;
  onSearchChange: (next: string) => void;
  /** Proveedores presentes en el período, para filtrar. */
  providers: string[];
  selectedProviders: string[];
  onProvidersChange: (next: string[]) => void;
  /** Página visible (1-indexada) y su tamaño; `total` cuenta las filas que pasan búsqueda y filtro. */
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpen: (row: BillingRow) => void;
  onRegisterInvoice: (row: BillingRow) => void;
  onApprove: (row: BillingRow) => void;
  onObject: (row: BillingRow) => void;
}

export const BillingList: React.FC<BillingListProps> = ({
  rows,
  loading,
  error,
  onRetry,
  search,
  onSearchChange,
  providers,
  selectedProviders,
  onProvidersChange,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onOpen,
  onRegisterInvoice,
  onApprove,
  onObject,
}) => {
  const hasRows = !loading && !error && rows.length > 0;
  // Sin filas por la búsqueda o el filtro no es lo mismo que sin externos:
  // lo primero invita a ajustar, lo segundo a asignar proveedor.
  const filtering = search.trim() !== "" || selectedProviders.length > 0;

  // La barra de búsqueda y filtro es un slot de Table, y la paginación el
  // otro: una sola card con barra, cabeceras, filas y pie. La carga, el error
  // y el vacío van como fila bajo las cabeceras, así la barra se queda
  // montada con sus valores mientras los datos cambian.
  return (
    <Table
      toolbar={
        <>
          <SearchField
            placeholder="Buscar persona o proveedor"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-xs"
          />
          {/* El proveedor deja de ser la unidad pero sigue siendo con quien
              se reclama: filtrar por él es cómo se arma la conversación con
              uno. Con uno solo no hay nada que filtrar. */}
          {providers.length > 1 && (
            <FilterButton
              label="Proveedor"
              options={providers.map((name) => ({ value: name, label: name }))}
              selected={selectedProviders}
              onChange={onProvidersChange}
            />
          )}
        </>
      }
      footer={
        hasRows ? (
          <PaginationBar
            page={page}
            pageCount={totalPages}
            onPageChange={onPageChange}
            total={total}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            onPageSizeChange={onPageSizeChange}
          />
        ) : undefined
      }
    >
      <TableHeader>
        <TableRow>
          <TableHead>Persona</TableHead>
          <TableHead>Proveedor</TableHead>
          <TableHead>Célula o CoE</TableHead>
          <TableHead align="right">Prefacturado</TableHead>
          <TableHead align="right">Esperado</TableHead>
          <TableHead align="right">Diferencia</TableHead>
          <TableHead>Novedades</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableStatusRow colSpan={9}>
            <p className="text-body-sm text-neutral-subtle">
              Cargando prefacturas…
            </p>
          </TableStatusRow>
        ) : error ? (
          <TableStatusRow colSpan={9}>
            <Alert
              variant="danger"
              title="No se pudo cargar la prefacturación"
              action={
                <Button variant="secondary" size="small" onClick={onRetry}>
                  Reintentar
                </Button>
              }
            >
              {error}
            </Alert>
          </TableStatusRow>
        ) : rows.length === 0 && filtering ? (
          <TableStatusRow colSpan={9}>
            <EmptyState
              icon={<Icon name="search" size={32} />}
              title="Sin resultados"
              description="No encontramos prefacturas con esa búsqueda o ese proveedor. Prueba ajustarlos."
            />
          </TableStatusRow>
        ) : rows.length === 0 ? (
          <TableStatusRow colSpan={9}>
            <EmptyState
              icon={<Icon name="team" size={32} />}
              title="No hay personas externas"
              description="Sin personas con proveedor no hay prefacturas que revisar. Asigna el proveedor desde la ficha de cada persona."
            />
          </TableStatusRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                {/* Enlace neutro: con uno por fila, el rojo teñiría la
                        columna entera. */}
                <Link asChild tone="neutral" className="font-medium">
                  <RouterLink to={billingPath(row.id)}>
                    {row.personName}
                  </RouterLink>
                </Link>
              </TableCell>
              <TableCell>
                <span className="text-neutral-subtle">{row.providerName}</span>
              </TableCell>
              <TableCell>
                <span className="text-neutral-subtle">
                  {row.costObjectText}
                </span>
              </TableCell>
              <TableCell align="right">
                <span className="tabular-nums font-semibold text-neutral-default">
                  {row.prefacturedText}
                </span>
              </TableCell>
              <TableCell align="right">
                <span className="tabular-nums text-neutral-subtle">
                  {row.expectedText}
                </span>
              </TableCell>
              <TableCell align="right">
                {/* La diferencia es la señal de la pantalla: severidad, no
                        decoración. En cero se lee conforme. */}
                <span
                  className={
                    row.differenceTone === "ok"
                      ? "tabular-nums text-success-default"
                      : row.differenceTone === "none"
                        ? "tabular-nums text-neutral-subtle"
                        : "tabular-nums font-semibold text-danger-default"
                  }
                >
                  {row.differenceText}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-neutral-subtle">{row.noveltiesText}</span>
              </TableCell>
              <TableCell>
                <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Menu
                    trigger={
                      <Button
                        variant="subtle"
                        size="small"
                        aria-label="Más acciones"
                      >
                        <Icon name="more" size={16} />
                      </Button>
                    }
                  >
                    <MenuItem
                      icon={<Icon name="link" size={16} />}
                      onSelect={() => onOpen(row)}
                    >
                      Abrir
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      icon={<Icon name="document" size={16} />}
                      disabled={!row.canRegisterPrefacture}
                      onSelect={() => onRegisterInvoice(row)}
                    >
                      Registrar prefactura
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      icon={<Icon name="check" size={16} />}
                      disabled={!row.canApprove}
                      onSelect={() => onApprove(row)}
                    >
                      Aprobar
                    </MenuItem>
                    <MenuItem
                      icon={<Icon name="comment" size={16} />}
                      disabled={!row.canObject}
                      onSelect={() => onObject(row)}
                    >
                      Objetar
                    </MenuItem>
                  </Menu>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
