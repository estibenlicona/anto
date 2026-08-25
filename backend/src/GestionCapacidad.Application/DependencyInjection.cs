using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using GestionCapacidad.Application.UseCases.Allocations.CreateAllocation;
using GestionCapacidad.Application.UseCases.Allocations.DeleteAllocation;
using GestionCapacidad.Application.UseCases.Allocations.GetAllocationsByPerson;
using GestionCapacidad.Application.UseCases.Allocations.GetAllocationsBySquad;
using GestionCapacidad.Application.UseCases.Allocations.UpdateAllocation;
using GestionCapacidad.Application.UseCases.Initiatives.ChangeInitiativeStatus;
using GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;
using GestionCapacidad.Application.UseCases.Initiatives.DeleteInitiative;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiativeById;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiatives;
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
using GestionCapacidad.Application.UseCases.People.RemovePersonFromChapter;
using GestionCapacidad.Application.UseCases.People.UpdatePerson;
using GestionCapacidad.Application.UseCases.Squads.CreateSquad;
using GestionCapacidad.Application.UseCases.Squads.DeleteSquad;
using GestionCapacidad.Application.UseCases.Squads.GetSquadById;
using GestionCapacidad.Application.UseCases.Squads.GetSquads;
using GestionCapacidad.Application.UseCases.Squads.UpdateSquad;

namespace GestionCapacidad.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

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

        // People
        services.AddScoped<CreatePersonUseCase>();
        services.AddScoped<GetPeopleUseCase>();
        services.AddScoped<GetPersonByIdUseCase>();
        services.AddScoped<UpdatePersonUseCase>();
        services.AddScoped<DeletePersonUseCase>();
        services.AddScoped<AssignPersonToChapterUseCase>();
        services.AddScoped<RemovePersonFromChapterUseCase>();
        services.AddScoped<AssignPersonToProviderUseCase>();

        // Initiatives
        services.AddScoped<CreateInitiativeUseCase>();
        services.AddScoped<GetInitiativesUseCase>();
        services.AddScoped<GetInitiativeByIdUseCase>();
        services.AddScoped<UpdateInitiativeUseCase>();
        services.AddScoped<ChangeInitiativeStatusUseCase>();
        services.AddScoped<DeleteInitiativeUseCase>();

        // BauTasks
        services.AddScoped<CreateBauTaskUseCase>();
        services.AddScoped<GetBauTasksUseCase>();
        services.AddScoped<UpdateBauTaskUseCase>();
        services.AddScoped<DeleteBauTaskUseCase>();

        // Allocations
        services.AddScoped<CreateAllocationUseCase>();
        services.AddScoped<GetAllocationsBySquadUseCase>();
        services.AddScoped<GetAllocationsByPersonUseCase>();
        services.AddScoped<UpdateAllocationUseCase>();
        services.AddScoped<DeleteAllocationUseCase>();

        return services;
    }
}
