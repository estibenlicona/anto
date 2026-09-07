using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.People.GetTechnicalLeads;

/// <summary>
/// Sólo quienes tienen el rol: es lo que el selector de líder técnico ofrece,
/// y resolverlo acá evita que cada pantalla vuelva a decidir qué es un líder
/// técnico.
/// </summary>
public sealed class GetTechnicalLeadsUseCase(IPersonRepository personRepository)
    : IUseCase<GetTechnicalLeadsResponse>
{
    public async Task<GetTechnicalLeadsResponse> ExecuteAsync(
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Person> people = await personRepository.GetAllAsync(cancellationToken);

        var leads = people
            .Where(p => p.Role == PersonRole.TechnicalLead)
            .OrderBy(p => p.Name, StringComparer.Ordinal)
            .Select(p => new PersonRefDto(p.Id, p.Name))
            .ToList();

        return new GetTechnicalLeadsResponse(leads);
    }
}
