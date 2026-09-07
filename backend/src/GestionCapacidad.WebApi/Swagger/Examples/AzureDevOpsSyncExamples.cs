using GestionCapacidad.Application.DataTransferObjects;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

public sealed class DevOpsUserDtoExample : IExamplesProvider<DevOpsUserDto>
{
    public DevOpsUserDto GetExamples() => new(
        "maria.gonzalez", "María González", "maria.gonzalez@tuya.com", null,
        ["Ecosistema Digital"], ["Backend Platform"], ["Board Backend Platform"]);
}

public sealed class SyncResultDtoExample : IExamplesProvider<SyncResultDto>
{
    public SyncResultDto GetExamples() => new(DateTime.UtcNow);
}
