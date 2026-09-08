using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Teams.CreateTeam;

public sealed class CreateTeamUseCase(
    ITeamRepository teamRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreateTeamRequest> validator) : IUseCase<CreateTeamRequest, CreateTeamResponse>
{
    public async Task<CreateTeamResponse> ExecuteAsync(
        CreateTeamRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        if (await teamRepository.ExistsByNameAsync(request.Name, cancellationToken: cancellationToken))
        {
            throw new BadRequestException($"A team named '{request.Name}' already exists.");
        }

        var team = new Team(request.Name, request.Description);

        await teamRepository.AddAsync(team, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Recién creado: todavía no puede tener células asociadas.
        return TeamMappings.ToCreateResponse(team, squadCount: 0);
    }
}
