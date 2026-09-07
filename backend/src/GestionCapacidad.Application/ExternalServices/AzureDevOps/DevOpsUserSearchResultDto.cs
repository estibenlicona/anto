namespace GestionCapacidad.Application.ExternalServices.AzureDevOps;

public sealed record DevOpsUserSearchResultDto(
    string Id,
    string DisplayName,
    string Email,
    string? AvatarUrl,
    IReadOnlyList<string> Projects,
    IReadOnlyList<string> Teams,
    IReadOnlyList<string> Boards);
