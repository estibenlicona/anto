using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using GestionCapacidad.Application.ExternalServices.AzureDevOps;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Infrastructure.ExternalServices.AzureDevOps;

/// <summary>
/// Cliente real contra Azure DevOps, mismo patrón que <c>CompanyRegistryClient</c>:
/// forma real de requests y mapeo de respuesta, contra un <c>BaseAddress</c>
/// de ejemplo hasta que exista una organización real que configurar. La
/// única regla de negocio que vive acá es traducir errores de transporte —
/// todo lo demás (qué es "comprometido", cómo se cuenta <c>wip</c>) es de
/// <see cref="Application.Dedication.SprintSnapshotSyncCalculator"/>.
/// </summary>
public sealed class AzureDevOpsClient(HttpClient httpClient) : IAzureDevOpsClient
{
    public async Task<DevOpsUserSearchResultDto?> SearchUserByEmailAsync(
        string email, CancellationToken cancellationToken = default)
    {
        var encodedEmail = Uri.EscapeDataString(email);
        using HttpResponseMessage response = await SendAsync(
            HttpMethod.Get, $"_apis/identities?searchFilter=General&filterValue={encodedEmail}&api-version=7.1",
            cancellationToken).ConfigureAwait(false);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        AzureDevOpsUserResponse? body = await ReadJsonAsync<AzureDevOpsUserResponse>(response, cancellationToken).ConfigureAwait(false);

        return body is null
            ? null
            : new DevOpsUserSearchResultDto(
                body.Id, body.DisplayName, body.Email, body.AvatarUrl, body.Projects, body.Teams, body.Boards);
    }

    public async Task<AzureDevOpsSyncDataDto> GetCollaboratorSyncDataAsync(
        string devOpsUserId, DateOnly sprintStart, DateOnly sprintEnd, CancellationToken cancellationToken = default)
    {
        var encodedUserId = Uri.EscapeDataString(devOpsUserId);
        using HttpResponseMessage response = await SendAsync(
            HttpMethod.Get,
            $"_apis/wit/workitems?assignedTo={encodedUserId}&from={sprintStart:yyyy-MM-dd}&to={sprintEnd:yyyy-MM-dd}&api-version=7.1",
            cancellationToken).ConfigureAwait(false);

        AzureDevOpsSyncDataResponse? body = await ReadJsonAsync<AzureDevOpsSyncDataResponse>(response, cancellationToken).ConfigureAwait(false);

        if (body is null)
        {
            return new AzureDevOpsSyncDataDto([], []);
        }

        return new AzureDevOpsSyncDataDto(
            [.. body.WorkItems.Select(ToRawWorkItemDto)],
            [.. body.Activity.Select(a => new RawActivityDayDto(a.Date, a.Commits, a.Releases, a.Features))]);
    }

    private async Task<HttpResponseMessage> SendAsync(HttpMethod method, string path, CancellationToken cancellationToken)
    {
        try
        {
            using var request = new HttpRequestMessage(method, path);
            HttpResponseMessage response = await httpClient.SendAsync(request, cancellationToken).ConfigureAwait(false);

            if (!response.IsSuccessStatusCode && response.StatusCode != HttpStatusCode.NotFound)
            {
                throw new ExternalServiceUnavailableException(
                    $"Azure DevOps respondió con {(int)response.StatusCode} para {method} {path}.");
            }

            return response;
        }
        catch (Exception exception) when (exception is HttpRequestException or TaskCanceledException && !cancellationToken.IsCancellationRequested)
        {
            throw new ExternalServiceUnavailableException("Azure DevOps no respondió.");
        }
    }

    /// <summary>
    /// Contra un <c>BaseAddress</c> de ejemplo, una respuesta "exitosa" puede
    /// no ser el JSON que Azure DevOps devolvería (p. ej. una página HTML) —
    /// eso también es "no respondió", no un error de programación.
    /// </summary>
    private static async Task<T?> ReadJsonAsync<T>(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        try
        {
            return await response.Content.ReadFromJsonAsync<T>(cancellationToken).ConfigureAwait(false);
        }
        catch (JsonException)
        {
            throw new ExternalServiceUnavailableException("Azure DevOps respondió con un contenido inesperado.");
        }
    }

    private static RawWorkItemDto ToRawWorkItemDto(AzureDevOpsWorkItemResponse item) => new(
        item.Id, item.Number, item.Title, item.Tag, item.EpicId, item.EpicTitle, item.InitiativeId,
        item.InitiativeName, item.Points, item.State, item.AddedAt, item.Board, item.Url,
        [.. item.Transitions.Select(t => new RawWorkItemTransitionDto(t.At, t.State))]);

    private sealed record AzureDevOpsUserResponse(
        string Id, string DisplayName, string Email, string? AvatarUrl,
        IReadOnlyList<string> Projects, IReadOnlyList<string> Teams, IReadOnlyList<string> Boards);

    private sealed record AzureDevOpsSyncDataResponse(
        IReadOnlyList<AzureDevOpsWorkItemResponse> WorkItems, IReadOnlyList<AzureDevOpsActivityDayResponse> Activity);

    private sealed record AzureDevOpsWorkItemResponse(
        string Id, int Number, string Title, string? Tag, string? EpicId, string? EpicTitle,
        string? InitiativeId, string? InitiativeName, decimal Points, string State, DateOnly AddedAt,
        string Board, string Url, IReadOnlyList<AzureDevOpsWorkItemTransitionResponse> Transitions);

    private sealed record AzureDevOpsWorkItemTransitionResponse(DateTime At, string State);

    private sealed record AzureDevOpsActivityDayResponse(DateOnly Date, int Commits, int Releases, int Features);
}
