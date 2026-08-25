import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Button,
  DateField,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Icon,
  Input,
  Link,
  Select,
  Switch,
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import { SECONDARY_TEXT } from "./detail/DetailPanel";
import {
  emptyPersonFormValues,
  personAdapter,
  type Person,
  type PersonFormValues,
} from "../adapters/PersonAdapter";
import type {
  CompanyDto,
  Modality,
  PersonRole,
  RoleOption,
  SeniorityOption,
  TechnicalLeadOption,
} from "../services/personService";
import { formatThousands, onlyDigits } from "@shared/services/currency";
import {
  MODALITY_OPTIONS,
  countMissingRequiredFields,
  validate,
  type FieldErrors,
} from "./personFormValidation";
import {
  losesTechnicalLeadReferences,
  technicalLeadOptions,
} from "./personFormOptions";

export interface PersonFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: Person;
  seniorities: SeniorityOption[];
  modalities: Modality[];
  roles: RoleOption[];
  /** Quiénes pueden ser líder técnico: las personas con ese rol. */
  technicalLeads: TechnicalLeadOption[];
  /** La línea de la persona; `null` mientras se resuelve o si no tiene. */
  expertiseLineName: string | null;
  companies: CompanyDto[];
  catalogsLoading: boolean;
  saving: boolean;
  serverError: string | null;
  onSubmit: (values: PersonFormValues) => void;
}

// Drawer en vez de Modal: con 13 campos este formulario es más alto que
// cualquier Modal del catálogo, y Modal (max-h-[85vh], overflow:visible)
// no encoge a ModalBody para que su scroll propio entre en juego. Drawer
// usa h-full (altura fija, no un tope) y DrawerBody es flex-1 overflow-y-auto,
// así que scrollea de verdad sin ningún workaround.
export const PersonFormDrawer: React.FC<PersonFormDrawerProps> = ({
  open,
  onOpenChange,
  person,
  seniorities,
  modalities,
  roles,
  technicalLeads,
  expertiseLineName,
  companies,
  catalogsLoading,
  saving,
  serverError,
  onSubmit,
}) => {
  const [values, setValues] = useState<PersonFormValues>(
    person ? personAdapter.toFormValues(person) : emptyPersonFormValues
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    onSubmit(values);
  };

  const missingRequiredCount = submitted
    ? countMissingRequiredFields(values)
    : 0;

  const modalityOptions =
    modalities.length > 0
      ? MODALITY_OPTIONS.filter((o) => modalities.includes(o.value))
      : MODALITY_OPTIONS;

  // El nombre del nivel, sin el número adelante: el catálogo ya lo trae
  // resuelto y la escala no se repite en la app.
  const seniorityOptions = seniorities.map((level) => ({
    value: String(level.value),
    label: level.label,
  }));

  const companyOptions = companies.map((company) => ({
    value: company.id,
    label: company.name,
  }));

  const roleOptions = roles.map((role) => ({
    value: role.value,
    label: role.label,
  }));

  // Nadie es su propio líder técnico: quien se está editando no se ofrece.
  const leadOptions = technicalLeadOptions(technicalLeads, person?.id).map(
    (lead) => ({ value: lead.id, label: lead.name })
  );

  // Quitarle el rol de Líder Técnico a quien lo es de alguien deja esas
  // referencias colgando. Se avisa antes de guardar y con el número: "afecta a
  // otras personas" no le dice a nadie si son dos o veinte.
  const dejaDeSerLead = losesTechnicalLeadReferences(person, values.role);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="lg">
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <DrawerHeader title={person ? "Editar persona" : "Crear persona"}>
          <p className="mt-1 text-body-sm text-neutral-subtle">
            {person
              ? "Actualiza la información de esta persona."
              : "Registra la información de una nueva persona en la plataforma."}
          </p>
        </DrawerHeader>
        {/* p-0: cada sección pone su propio px-6 py-5, para que los filetes
            que las separan lleguen de borde a borde. */}
        <DrawerBody className="p-0">
          <FormSection icon="user" title="Información personal" first>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre completo"
                required
                placeholder="Ej. Juan Pérez Gómez"
                value={values.name}
                error={errors.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
              />
              <Input
                label="Documento"
                required
                placeholder="Ej. 12345678"
                value={values.documentId}
                error={errors.documentId}
                onChange={(e) =>
                  setValues({ ...values, documentId: e.target.value })
                }
              />
            </div>
            <Input
              label="Usuario corporativo (UPN)"
              required
              placeholder="Ej. juan.perez@tuya.com.co"
              hint="Identificador utilizado para iniciar sesión en Microsoft 365."
              value={values.userPrincipalName}
              error={errors.userPrincipalName}
              onChange={(e) =>
                setValues({ ...values, userPrincipalName: e.target.value })
              }
            />
          </FormSection>

          <FormSection icon="work-item" title="Información laboral">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Cargo"
                required
                placeholder="Ej. Ingeniera de datos"
                value={values.position}
                error={errors.position}
                onChange={(e) =>
                  setValues({ ...values, position: e.target.value })
                }
              />
              {/*
                Selector y no texto: el rol dice cómo participa la persona en
                la aplicación, y mientras se pudo escribir se llenó con el
                cargo —los dos campos con el mismo valor—, que es como el
                sistema perdió la forma de saber quién es líder técnico.
              */}
              <Select
                label="Rol"
                required
                placeholder="Seleccionar rol"
                options={roleOptions}
                loading={catalogsLoading}
                value={values.role || undefined}
                error={errors.role}
                onValueChange={(value) =>
                  setValues({ ...values, role: value as PersonRole })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {leadOptions.length > 0 ? (
                <Select
                  label="Líder técnico"
                  placeholder="Sin líder técnico"
                  hint="Quién la acompaña técnicamente. No decide qué ve."
                  options={leadOptions}
                  loading={catalogsLoading}
                  value={values.technicalLeadId || undefined}
                  onValueChange={(value) =>
                    setValues({ ...values, technicalLeadId: value })
                  }
                />
              ) : (
                /*
                  Sin nadie con ese rol, un selector vacío se lee como un
                  error de la pantalla. Decir por qué está vacío y qué hacer
                  es lo que lo convierte en un estado y no en una falla.
                */
                <div>
                  <span className="text-label text-neutral-default">
                    Líder técnico
                  </span>
                  <p className="mt-1 text-body-sm text-neutral-subtle">
                    Todavía no hay nadie con el rol de Líder Técnico. Asigna ese
                    rol en la ficha de una persona y va a aparecer acá.
                  </p>
                </div>
              )}
              {/*
                La línea se ve y no se elige: se cambia donde se ve el reparto
                completo, y dos lugares que la editen con distinta información
                a la vista terminan discrepando.
              */}
              <div>
                <span className="text-label text-neutral-default">
                  Línea de expertise
                </span>
                <p className="mt-1 text-body-sm text-neutral-default">
                  {expertiseLineName ?? (
                    <span className={SECONDARY_TEXT}>Sin línea asignada</span>
                  )}
                  <Link asChild tone="neutral" className="ml-2 text-body-sm">
                    <RouterLink to="/app/admin/lineas">
                      {expertiseLineName ? "Cambiar" : "Asignar una línea"}
                    </RouterLink>
                  </Link>
                </p>
              </div>
            </div>
            {dejaDeSerLead && (
              <p className="rounded-control border-default border-warning-default bg-warning-subtle p-3 text-body-sm text-neutral-default">
                {person!.name} figura como líder técnico de{" "}
                <b className="font-bold">
                  {person!.technicalLeadOfCount}{" "}
                  {person!.technicalLeadOfCount === 1 ? "persona" : "personas"}
                </b>
                . Al cambiarle el rol,{" "}
                {person!.technicalLeadOfCount === 1
                  ? "esa persona queda"
                  : "esas personas quedan"}{" "}
                sin líder técnico.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Seniority"
                required
                placeholder="Seleccionar seniority"
                options={seniorityOptions}
                loading={catalogsLoading}
                value={values.seniority || undefined}
                error={errors.seniority}
                onValueChange={(value) =>
                  setValues({ ...values, seniority: value })
                }
              />
              <Select
                label="Modalidad"
                required
                placeholder="Seleccionar modalidad"
                options={modalityOptions}
                loading={catalogsLoading}
                value={values.modality || undefined}
                error={errors.modality}
                onValueChange={(value) =>
                  setValues({ ...values, modality: value as Modality })
                }
              />
            </div>
          </FormSection>

          <FormSection icon="calendar" title="Asignación y disponibilidad">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="number"
                label="FTE disponible"
                required
                suffix="FTE"
                hint="Valor entre 0 y 1."
                value={values.availableFte}
                error={errors.availableFte}
                onChange={(e) =>
                  setValues({ ...values, availableFte: e.target.value })
                }
              />
              {/*
                Texto y no `type="number"`: un campo numérico no admite
                separadores, y sin ellos nadie puede contar siete cifras sin
                salir del campo. Lo que se ve lleva puntos; lo que se guarda
                en el formulario —y viaja al backend— son los dígitos.
              */}
              <Input
                inputMode="numeric"
                label="Costo mensual"
                required
                prefix="COP"
                placeholder="0"
                value={formatThousands(values.monthlyCost)}
                error={errors.monthlyCost}
                onChange={(e) =>
                  setValues({
                    ...values,
                    monthlyCost: onlyDigits(e.target.value),
                  })
                }
              />
            </div>
            <DateField
              label="Fecha de inicio"
              value={values.startDate}
              error={errors.startDate}
              onValueChange={(value) =>
                setValues({ ...values, startDate: value })
              }
            />
            <div className="flex flex-col gap-2 rounded-control border-default border-neutral-default bg-neutral-subtle p-3">
              <Switch
                label="Personal externo"
                checked={values.isExternal}
                onCheckedChange={(checked) =>
                  setValues({
                    ...values,
                    isExternal: checked,
                    providerId: checked ? values.providerId : "",
                  })
                }
              />
              <p className="text-body-sm text-neutral-subtle">
                Actívalo si la persona no pertenece a la nómina interna.
              </p>
            </div>
            {values.isExternal && (
              <Select
                label="Proveedor"
                required
                placeholder="Seleccionar proveedor"
                options={companyOptions}
                loading={catalogsLoading}
                value={values.providerId || undefined}
                error={errors.providerId}
                onValueChange={(value) =>
                  setValues({ ...values, providerId: value })
                }
              />
            )}
            {serverError && (
              <p className="text-body-sm text-danger-default">{serverError}</p>
            )}
          </FormSection>
        </DrawerBody>
        {/* DrawerFooter no trae justify-between por defecto (a diferencia de
            ModalFooter en tuip) — se agrega acá para que el contador de
            campos obligatorios (izquierda) y los botones (derecha) queden
            en los extremos. El div izquierdo siempre está presente (aunque
            vacío) para que space-between no empuje los botones al inicio
            cuando no hay mensaje que mostrar. */}
        <DrawerFooter className="flex items-center justify-between">
          <div>
            {missingRequiredCount > 0 && (
              <p className="text-body-sm text-danger-default">
                {missingRequiredCount}{" "}
                {missingRequiredCount === 1
                  ? "campo obligatorio sin llenar"
                  : "campos obligatorios sin llenar"}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              iconBefore={<Icon name={person ? "save" : "plus"} size={20} />}
            >
              {saving
                ? "Guardando…"
                : person
                  ? "Guardar cambios"
                  : "Crear persona"}
            </Button>
          </div>
        </DrawerFooter>
      </form>
    </Drawer>
  );
};
