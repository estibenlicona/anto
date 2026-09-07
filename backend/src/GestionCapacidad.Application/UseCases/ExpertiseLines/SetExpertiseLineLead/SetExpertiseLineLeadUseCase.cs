using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExpertiseLines;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.ExpertiseLines.SetExpertiseLineLead;

public sealed record SetExpertiseLineLeadRequest(Guid Id, Guid? PersonId);

public sealed record SetExpertiseLineLeadResponse(ExpertiseLineDetailDto Line);

/// <summary>
/// Designa o retira el lead de una línea. Designar incorpora a la persona a
/// la línea (moviéndola desde la que tuviera) y le quita el lead a cualquier
/// otra línea que lo tuviera — una persona no lidera más de una a la vez.
/// </summary>
public sealed class SetExpertiseLineLeadUseCase(
    IExpertiseLineRepository lineRepository,
    IPersonRepository personRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork) : IUseCase<SetExpertiseLineLeadRequest, SetExpertiseLineLeadResponse>
{
    public async Task<SetExpertiseLineLeadResponse> ExecuteAsync(
        SetExpertiseLineLeadRequest request, CancellationToken cancellationToken = default)
    {
        ExpertiseLine? line = await lineRepository.GetByIdAsync(request.Id, cancellationToken);
        if (line is null)
        {
            throw new NotFoundException("Línea no encontrada");
        }

        if (request.PersonId is Guid personId)
        {
            Person? person = await personRepository.GetByIdAsync(personId, cancellationToken);
            if (person is null)
            {
                throw new NotFoundException("Persona no encontrada");
            }

            IReadOnlyList<ExpertiseLine> allLines = await lineRepository.GetAllAsync(cancellationToken);
            ExpertiseLine? previousLead = allLines.FirstOrDefault(l => l.Id != line.Id && l.LeadId == personId);
            if (previousLead is not null)
            {
                previousLead.SetLead(null);
                lineRepository.Update(previousLead);
            }

            person.AssignToExpertiseLine(line.Id);
            personRepository.Update(person);
            line.SetLead(personId);
        }
        else
        {
            line.SetLead(null);
        }

        lineRepository.Update(line);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        IReadOnlyList<Person> linePeople = await personRepository.GetByExpertiseLineAsync(line.Id, cancellationToken);
        Person? lead = line.LeadId is Guid leadId ? await personRepository.GetByIdAsync(leadId, cancellationToken) : null;
        IReadOnlyList<Allocation> allocations = await allocationRepository.GetAllAsync(cancellationToken);
        Dictionary<Guid, Allocation> allocationByPerson = allocations
            .GroupBy(a => a.PersonId)
            .ToDictionary(g => g.Key, g => g.First());
        IReadOnlyList<Squad> squads = await squadRepository.GetAllAsync(cancellationToken);
        Dictionary<Guid, string> squadNameById = squads.ToDictionary(s => s.Id, s => s.Name);

        return new SetExpertiseLineLeadResponse(
            ExpertiseLineMappings.ToDetailDto(line, linePeople, lead, allocationByPerson, squadNameById));
    }
}
