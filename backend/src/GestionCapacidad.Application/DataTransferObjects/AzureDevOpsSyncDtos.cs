namespace GestionCapacidad.Application.DataTransferObjects;

public sealed record DevOpsUserDto(
    string Id,
    string DisplayName,
    string Email,
    string? AvatarUrl,
    IReadOnlyList<string> Projects,
    IReadOnlyList<string> Teams,
    IReadOnlyList<string> Boards);

public sealed record SyncResultDto(DateTime LastSyncedAt);
