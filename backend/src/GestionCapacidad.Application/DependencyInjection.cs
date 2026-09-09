using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using GestionCapacidad.Application.UseCases.Allocations.CreateAllocation;
using GestionCapacidad.Application.UseCases.Allocations.DeleteAllocation;
using GestionCapacidad.Application.UseCases.Allocations.GetAllocationsByPerson;
using GestionCapacidad.Application.UseCases.Allocations.GetAllocationsBySquad;
using GestionCapacidad.Application.UseCases.Allocations.UpdateAllocation;
using GestionCapacidad.Application.UseCases.Absences.CreateAbsence;
using GestionCapacidad.Application.UseCases.Absences.GetAbsencesByMonth;
using GestionCapacidad.Application.UseCases.Absences.UpdateAbsenceStatus;
using GestionCapacidad.Application.UseCases.Billing.GeneratePrefactures;
using GestionCapacidad.Application.UseCases.Billing.GetPrefactureById;
using GestionCapacidad.Application.UseCases.Billing.GetPrefactures;
using GestionCapacidad.Application.UseCases.Billing.RegisterPrefactureDocument;
using GestionCapacidad.Application.UseCases.Billing.RemoveBillingAdjustment;
using GestionCapacidad.Application.UseCases.Billing.SetBillingAdjustment;
using GestionCapacidad.Application.UseCases.Billing.SetBillingStatus;
using GestionCapacidad.Application.UseCases.Billing.SetPrefacturedAmount;
using GestionCapacidad.Application.UseCases.Skills.CreateSkill;
using GestionCapacidad.Application.UseCases.Skills.DeleteSkill;
using GestionCapacidad.Application.UseCases.Skills.GetSkillsCatalog;
using GestionCapacidad.Application.UseCases.Skills.SetSkillActive;
using GestionCapacidad.Application.UseCases.Skills.SetSkillCriteria;
using GestionCapacidad.Application.UseCases.Skills.SetSkillExpectation;
using GestionCapacidad.Application.UseCases.Skills.UpdateSkill;
using GestionCapacidad.Application.UseCases.Assessments.CloseAssessment;
using GestionCapacidad.Application.UseCases.Assessments.GetAssessment;
using GestionCapacidad.Application.UseCases.Assessments.OpenAssessment;
using GestionCapacidad.Application.UseCases.Assessments.SaveAssessmentSkill;
using GestionCapacidad.Application.UseCases.Dedication.GetCollaborators;
using GestionCapacidad.Application.UseCases.Dedication.GetCollaboratorDetail;
using GestionCapacidad.Application.UseCases.Dedication.SyncCollaborator;
using GestionCapacidad.Application.UseCases.Dedication.SyncAllCollaborators;
using GestionCapacidad.Application.UseCases.Admin.GetCapabilityMix;
using GestionCapacidad.Application.UseCases.Admin;
using GestionCapacidad.Application.UseCases.Admin.GetQuestionPool;
using GestionCapacidad.Application.UseCases.Admin.GetSprintConfig;
using GestionCapacidad.Application.UseCases.Admin.GetTallaBands;
using GestionCapacidad.Application.UseCases.Admin.SaveCapabilityMix;
using GestionCapacidad.Application.UseCases.Admin.SaveQuestionPool;
using GestionCapacidad.Application.UseCases.Admin.SaveSprintConfig;
using GestionCapacidad.Application.UseCases.Admin.SaveTallaBands;
using GestionCapacidad.Application.UseCases.Initiatives.ChangeInitiativeStatus;
using GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;
using GestionCapacidad.Application.UseCases.Initiatives.GetEvaluationModel;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiativeById;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiatives;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiativesStats;
using GestionCapacidad.Application.UseCases.Initiatives.SaveEvaluation;
using GestionCapacidad.Application.UseCases.Initiatives.UpdateInitiative;
using GestionCapacidad.Application.UseCases.BauTasks.CreateBauTask;
using GestionCapacidad.Application.UseCases.BauTasks.DeleteBauTask;
using GestionCapacidad.Application.UseCases.BauTasks.GetBauTasks;
using GestionCapacidad.Application.UseCases.BauTasks.UpdateBauTask;
using GestionCapacidad.Application.UseCases.Companies.CreateCompany;
using GestionCapacidad.Application.UseCases.Companies.DeleteCompany;
using GestionCapacidad.Application.UseCases.Companies.GetCompanies;
using GestionCapacidad.Application.UseCases.Companies.GetCompanyById;
using GestionCapacidad.Application.UseCases.Companies.UpdateCompany;
using GestionCapacidad.Application.UseCases.CompanyRegistry.GetExternalCompany;
using GestionCapacidad.Application.UseCases.People.AssignPersonToChapter;
using GestionCapacidad.Application.UseCases.People.AssignPersonToProvider;
using GestionCapacidad.Application.UseCases.People.CreatePerson;
using GestionCapacidad.Application.UseCases.People.DeletePerson;
using GestionCapacidad.Application.UseCases.People.GetPeople;
using GestionCapacidad.Application.UseCases.People.GetPersonById;
using GestionCapacidad.Application.UseCases.People.GetPersonExpertiseLine;
using GestionCapacidad.Application.UseCases.People.GetPeopleStats;
using GestionCapacidad.Application.UseCases.People.GetTechnicalLeads;
using GestionCapacidad.Application.UseCases.People.ReplacePersonStacks;
using GestionCapacidad.Application.UseCases.People.RemovePersonFromChapter;
using GestionCapacidad.Application.UseCases.People.UpdatePerson;
using GestionCapacidad.Application.UseCases.Squads.CreateSquad;
using GestionCapacidad.Application.UseCases.Squads.DeleteSquad;
using GestionCapacidad.Application.UseCases.Squads.GetSquadById;
using GestionCapacidad.Application.UseCases.Squads.GetSquads;
using GestionCapacidad.Application.UseCases.Squads.GetSquadsStats;
using GestionCapacidad.Application.UseCases.Squads.GetSquadTeamStats;
using GestionCapacidad.Application.UseCases.Squads.UpdateSquad;
using GestionCapacidad.Application.UseCases.Teams.CreateTeam;
using GestionCapacidad.Application.UseCases.Teams.DeleteTeam;
using GestionCapacidad.Application.UseCases.Teams.GetTeamById;
using GestionCapacidad.Application.UseCases.Teams.GetTeams;
using GestionCapacidad.Application.UseCases.Teams.UpdateTeam;
using GestionCapacidad.Application.UseCases.CareerPlan.GetSpanMatrix;
using GestionCapacidad.Application.UseCases.CareerPlan.GetSpanSummary;
using GestionCapacidad.Application.UseCases.CareerPlan.GetPersonPlan;
using GestionCapacidad.Application.UseCases.CareerPlan.CreatePlanAction;
using GestionCapacidad.Application.UseCases.CareerPlan.SetPlanActionStatus;
using GestionCapacidad.Application.UseCases.ControlTower.GetChapterCapacityOverview;
using GestionCapacidad.Application.UseCases.ExpertiseLines.GetExpertiseLines;
using GestionCapacidad.Application.UseCases.ExpertiseLines.GetExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.CreateExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.UpdateExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.ArchiveExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.ReactivateExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.SetExpertiseLineLead;
using GestionCapacidad.Application.UseCases.ExpertiseLines.AddExpertiseLinePeople;
using GestionCapacidad.Application.UseCases.ExpertiseLines.RemoveExpertiseLinePerson;
using GestionCapacidad.Application.UseCases.ExpertiseLines.GetExpertiseRoster;
using GestionCapacidad.Application.UseCases.PersonDetail.GetPersonDetail;
using GestionCapacidad.Application.UseCases.PersonDetail.LinkDevOpsIdentity;
using GestionCapacidad.Application.UseCases.PersonDetail.SearchDevOpsUser;

namespace GestionCapacidad.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        // El reloj se inyecta para que "cuándo se guardó" sea verificable en
        // los tests en vez de depender de DateTime.UtcNow.
        services.TryAddSingleton(TimeProvider.System);

        // Companies
        services.AddScoped<CreateCompanyUseCase>();
        services.AddScoped<GetCompaniesUseCase>();
        services.AddScoped<GetCompanyByIdUseCase>();
        services.AddScoped<UpdateCompanyUseCase>();
        services.AddScoped<DeleteCompanyUseCase>();
        services.AddScoped<GetExternalCompanyUseCase>();

        // Squads
        services.AddScoped<CreateSquadUseCase>();
        services.AddScoped<GetSquadsUseCase>();
        services.AddScoped<GetSquadByIdUseCase>();
        services.AddScoped<UpdateSquadUseCase>();
        services.AddScoped<DeleteSquadUseCase>();
        services.AddScoped<GetSquadsStatsUseCase>();
        services.AddScoped<GetSquadTeamStatsUseCase>();

        // Teams
        services.AddScoped<CreateTeamUseCase>();
        services.AddScoped<GetTeamsUseCase>();
        services.AddScoped<GetTeamByIdUseCase>();
        services.AddScoped<UpdateTeamUseCase>();
        services.AddScoped<DeleteTeamUseCase>();

        // People
        services.AddScoped<CreatePersonUseCase>();
        services.AddScoped<GetPeopleUseCase>();
        services.AddScoped<GetPersonByIdUseCase>();
        services.AddScoped<GetPersonExpertiseLineUseCase>();
        services.AddScoped<UpdatePersonUseCase>();
        services.AddScoped<DeletePersonUseCase>();
        services.AddScoped<AssignPersonToChapterUseCase>();
        services.AddScoped<RemovePersonFromChapterUseCase>();
        services.AddScoped<AssignPersonToProviderUseCase>();
        services.AddScoped<GetPeopleStatsUseCase>();
        services.AddScoped<ReplacePersonStacksUseCase>();
        services.AddScoped<GetTechnicalLeadsUseCase>();

        // Initiatives
        services.AddScoped<CreateInitiativeUseCase>();
        services.AddScoped<GetInitiativesUseCase>();
        services.AddScoped<GetInitiativeByIdUseCase>();
        services.AddScoped<UpdateInitiativeUseCase>();
        services.AddScoped<ChangeInitiativeStatusUseCase>();
        services.AddScoped<SaveEvaluationUseCase>();
        services.AddScoped<GetEvaluationModelUseCase>();
        services.AddScoped<GetInitiativesStatsUseCase>();

        // BauTasks
        services.AddScoped<CreateBauTaskUseCase>();
        services.AddScoped<GetBauTasksUseCase>();
        services.AddScoped<UpdateBauTaskUseCase>();
        services.AddScoped<DeleteBauTaskUseCase>();

        // Absences
        services.AddScoped<GetAbsencesByMonthUseCase>();
        services.AddScoped<CreateAbsenceUseCase>();
        services.AddScoped<UpdateAbsenceStatusUseCase>();

        // Admin (parámetros del modelo)
        services.AddScoped<GetSprintConfigUseCase>();
        services.AddScoped<SaveSprintConfigUseCase>();
        services.AddScoped<GetTallaBandsUseCase>();
        services.AddScoped<SaveTallaBandsUseCase>();
        services.AddScoped<GetCapabilityMixUseCase>();
        services.AddScoped<SaveCapabilityMixUseCase>();
        services.AddScoped<GetQuestionPoolUseCase>();
        // El modelo de estimación versionado.
        services.AddScoped<GetEstimationModelsUseCase>();
        services.AddScoped<GetModelVersionContentUseCase>();
        services.AddScoped<GetModelVersionValidationUseCase>();
        services.AddScoped<GetModelVersionDiffUseCase>();
        services.AddScoped<GetModelVersionHistoryUseCase>();
        services.AddScoped<CreateModelVersionUseCase>();
        services.AddScoped<SaveModelDimensionsUseCase>();
        services.AddScoped<SaveModelDriversUseCase>();
        services.AddScoped<SaveModelTallaRulesUseCase>();
        services.AddScoped<SaveModelMixUseCase>();
        services.AddScoped<PublishModelVersionUseCase>();
        services.AddScoped<SaveQuestionPoolUseCase>();

        // Allocations
        services.AddScoped<CreateAllocationUseCase>();
        services.AddScoped<GetAllocationsBySquadUseCase>();
        services.AddScoped<GetAllocationsByPersonUseCase>();
        services.AddScoped<UpdateAllocationUseCase>();
        services.AddScoped<DeleteAllocationUseCase>();

        // Prefacturación
        services.AddScoped<GetPrefacturesUseCase>();
        services.AddScoped<GetPrefactureByIdUseCase>();
        services.AddScoped<GeneratePrefacturesUseCase>();
        services.AddScoped<RegisterPrefactureDocumentUseCase>();
        services.AddScoped<SetPrefacturedAmountUseCase>();
        services.AddScoped<SetBillingAdjustmentUseCase>();
        services.AddScoped<RemoveBillingAdjustmentUseCase>();
        services.AddScoped<SetBillingStatusUseCase>();

        // Catálogo de habilidades
        services.AddScoped<GetSkillsCatalogUseCase>();
        services.AddScoped<CreateSkillUseCase>();
        services.AddScoped<UpdateSkillUseCase>();
        services.AddScoped<DeleteSkillUseCase>();
        services.AddScoped<SetSkillActiveUseCase>();
        services.AddScoped<SetSkillExpectationUseCase>();
        services.AddScoped<SetSkillCriteriaUseCase>();

        // Evaluaciones
        services.AddScoped<GetAssessmentUseCase>();
        services.AddScoped<OpenAssessmentUseCase>();
        services.AddScoped<SaveAssessmentSkillUseCase>();
        services.AddScoped<CloseAssessmentUseCase>();

        // Capacidad (dedicación)
        services.AddScoped<GetCollaboratorsUseCase>();
        services.AddScoped<GetCollaboratorDetailUseCase>();
        services.AddScoped<SyncCollaboratorUseCase>();
        services.AddScoped<SyncAllCollaboratorsUseCase>();

        // Competencias (span y planes)
        services.AddScoped<GetSpanMatrixUseCase>();
        services.AddScoped<GetSpanSummaryUseCase>();
        services.AddScoped<GetPersonPlanUseCase>();
        services.AddScoped<CreatePlanActionUseCase>();
        services.AddScoped<SetPlanActionStatusUseCase>();

        // Torre de control
        services.AddScoped<GetChapterCapacityOverviewUseCase>();

        // Líneas de expertise
        services.AddScoped<GetExpertiseLinesUseCase>();
        services.AddScoped<GetExpertiseLineUseCase>();
        services.AddScoped<CreateExpertiseLineUseCase>();
        services.AddScoped<UpdateExpertiseLineUseCase>();
        services.AddScoped<ArchiveExpertiseLineUseCase>();
        services.AddScoped<ReactivateExpertiseLineUseCase>();
        services.AddScoped<SetExpertiseLineLeadUseCase>();
        services.AddScoped<AddExpertiseLinePeopleUseCase>();
        services.AddScoped<RemoveExpertiseLinePersonUseCase>();
        services.AddScoped<GetExpertiseRosterUseCase>();

        // Detalle de persona
        services.AddScoped<GetPersonDetailUseCase>();
        services.AddScoped<LinkDevOpsIdentityUseCase>();
        services.AddScoped<SearchDevOpsUserUseCase>();

        return services;
    }
}
