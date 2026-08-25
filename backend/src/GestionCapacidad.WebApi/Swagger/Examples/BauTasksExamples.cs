using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.BauTasks.CreateBauTask;
using GestionCapacidad.Application.UseCases.BauTasks.UpdateBauTask;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

public sealed class BauTaskDtoExample : IExamplesProvider<BauTaskDto>
{
    public BauTaskDto GetExamples() => new(
        Id: Guid.Parse("c4d5e6f7-a8b9-4c0d-8e1f-2a3b4c5d6e7f"),
        SquadId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        Name: "Soporte nivel 2 - Pagos",
        CreatedAtUtc: DateTime.Parse("2026-01-10T09:00:00Z"),
        UpdatedAtUtc: null);
}

public sealed class CreateBauTaskRequestExample : IExamplesProvider<CreateBauTaskRequest>
{
    public CreateBauTaskRequest GetExamples() => new(
        SquadId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        Name: "Soporte nivel 2 - Pagos");
}

public sealed class CreateBauTaskResponseExample : IExamplesProvider<CreateBauTaskResponse>
{
    public CreateBauTaskResponse GetExamples() => new(new BauTaskDtoExample().GetExamples());
}

public sealed class UpdateBauTaskRequestExample : IExamplesProvider<UpdateBauTaskRequest>
{
    public UpdateBauTaskRequest GetExamples() => new(
        SquadId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        TaskId: Guid.Parse("c4d5e6f7-a8b9-4c0d-8e1f-2a3b4c5d6e7f"),
        Name: "Soporte nivel 3 - Pagos");
}

public sealed class UpdateBauTaskResponseExample : IExamplesProvider<UpdateBauTaskResponse>
{
    public UpdateBauTaskResponse GetExamples() => new(new BauTaskDtoExample().GetExamples());
}
