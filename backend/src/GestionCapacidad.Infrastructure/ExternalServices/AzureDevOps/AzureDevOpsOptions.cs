namespace GestionCapacidad.Infrastructure.ExternalServices.AzureDevOps;

public sealed class AzureDevOpsOptions
{
    public const string SectionName = "HttpClients:AzureDevOps";

    /// <summary>Resource id de Azure DevOps para pedir el token con <c>DefaultAzureCredential</c> en producción.</summary>
    public const string DefaultScope = "499b84ac-1321-427f-aa17-267ca6975798/.default";

    public required Uri BaseAddress { get; set; }

    public int TimeoutSeconds { get; set; } = 30;

    /// <summary>Sólo en desarrollo: Personal Access Token de una organización de prueba, vía User Secrets.</summary>
    public string? Pat { get; set; }

    /// <summary>Sólo en producción: scope del token que pide <c>DefaultAzureCredential</c>.</summary>
    public string Scope { get; set; } = DefaultScope;
}
