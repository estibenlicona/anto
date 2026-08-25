import { useEffect, useState } from "react";
import {
  personService,
  type CompanyDto,
  type Modality,
  type RoleOption,
  type SeniorityOption,
  type TechnicalLeadOption,
} from "../services/personService";

// Un solo hook para los catálogos del formulario: los necesita todos juntos al
// abrirse y no hay ningún caso en que se pidan por separado. Los líderes
// técnicos van acá y no aparte porque son eso mismo — una lista cerrada que el
// servidor resuelve— aunque salgan de las personas y no de un maestro propio.
export const useCatalogs = () => {
  const [seniorities, setSeniorities] = useState<SeniorityOption[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [technicalLeads, setTechnicalLeads] = useState<TechnicalLeadOption[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      personService.getSeniorities(),
      personService.getModalities(),
      personService.getCompanies(),
      personService.getRoles(),
      personService.getTechnicalLeads(),
    ])
      .then(
        ([
          seniorityValues,
          modalityValues,
          companyValues,
          roleValues,
          leadValues,
        ]) => {
          if (cancelled) return;
          setSeniorities(seniorityValues);
          setModalities(modalityValues);
          setCompanies(companyValues);
          setRoles(roleValues);
          setTechnicalLeads(leadValues);
          setLoading(false);
        }
      )
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar los catálogos"
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    seniorities,
    modalities,
    companies,
    roles,
    technicalLeads,
    loading,
    error,
  };
};
