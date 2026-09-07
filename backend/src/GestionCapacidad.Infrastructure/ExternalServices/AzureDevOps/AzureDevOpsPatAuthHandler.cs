using System.Net.Http.Headers;
using System.Text;

namespace GestionCapacidad.Infrastructure.ExternalServices.AzureDevOps;

/// <summary>
/// Sólo para desarrollo local: Azure DevOps acepta un Personal Access Token
/// como usuario Basic vacío + el PAT como contraseña. Ver design.md, decisión 9.
/// </summary>
public sealed class AzureDevOpsPatAuthHandler(string pat) : DelegatingHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var token = Convert.ToBase64String(Encoding.ASCII.GetBytes($":{pat}"));
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", token);
        return base.SendAsync(request, cancellationToken);
    }
}
