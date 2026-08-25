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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import type { BillingRow } from "../adapters/BillingAdapter";

export const billingPath = (id: string) => `/app/lead/facturacion/${id}`;

export interface BillingListProps {
  rows: BillingRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Proveedores presentes en el período, para filtrar. */
  providers: string[];
  selectedProviders: string[];
  onProvidersChange: (next: string[]) => void;
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
  providers,
  selectedProviders,
  onProvidersChange,
  onOpen,
  onRegisterInvoice,
  onApprove,
  onObject,
}) => {
  if (error) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* El proveedor deja de ser la unidad pero sigue siendo con quien se
          reclama: filtrar por él es cómo se arma la conversación con uno. */}
      {providers.length > 1 && (
        <div className="flex items-center gap-2">
          <FilterButton
            label="Proveedor"
            options={providers.map((name) => ({ value: name, label: name }))}
            selected={selectedProviders}
            onChange={onProvidersChange}
          />
        </div>
      )}
      {loading ? (
        <p className="text-body-sm text-neutral-subtle">
          Cargando prefacturas…
        </p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Icon name="team" size={32} />}
          title="No hay personas externas"
          description="Sin personas con proveedor no hay prefacturas que revisar. Asigna el proveedor desde la ficha de cada persona."
        />
      ) : (
        <div className="overflow-hidden rounded-surface border border-neutral-default">
          <Table flush>
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
              {rows.map((row) => (
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
                    <span className="text-neutral-subtle">
                      {row.providerName}
                    </span>
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
                    <span className="text-neutral-subtle">
                      {row.noveltiesText}
                    </span>
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
