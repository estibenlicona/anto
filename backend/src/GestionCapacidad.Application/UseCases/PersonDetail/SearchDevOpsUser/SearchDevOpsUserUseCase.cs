using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.ExternalServices.AzureDevOps;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Application.UseCases.PersonDetail.SearchDevOpsUser;

public sealed record SearchDevOpsUserRequest(string? Email);

public sealed record SearchDevOpsUserResponse(DevOpsUserDto User);

/// <summary>Busca en Azure DevOps la identidad de un correo corporativo — no vincula nada, sólo resuelve la búsqueda.</summary>
public sealed class SearchDevOpsUserUseCase(IAzureDevOpsClient client)
    : IUseCase<SearchDevOpsUserRequest, SearchDevOpsUserResponse>
{
    public async Task<SearchDevOpsUserResponse> ExecuteAsync(
        SearchDevOpsUserRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new BadRequestException("El correo es obligatorio");
        }

        DevOpsUserSearchResultDto? result = await client.SearchUserByEmailAsync(request.Email, cancellationToken);
        if (result is null)
        {
            throw new NotFoundException("Sin coincidencia en Azure DevOps para ese correo");
        }

        return new SearchDevOpsUserResponse(new DevOpsUserDto(
            result.Id, result.DisplayName, result.Email, result.AvatarUrl, result.Projects, result.Teams, result.Boards));
    }
}
