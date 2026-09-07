namespace GestionCapacidad.Application.ExternalServices.AzureDevOps;

public interface IAzureDevOpsClient
{
    /// <summary>Nula si Azure DevOps no tiene ninguna identidad con ese correo.</summary>
    Task<DevOpsUserSearchResultDto?> SearchUserByEmailAsync(
        string email,
        CancellationToken cancellationToken = default);

    Task<AzureDevOpsSyncDataDto> GetCollaboratorSyncDataAsync(
        string devOpsUserId,
        DateOnly sprintStart,
        DateOnly sprintEnd,
        CancellationToken cancellationToken = default);
}
