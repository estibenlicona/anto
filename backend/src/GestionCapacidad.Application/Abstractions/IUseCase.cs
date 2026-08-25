namespace GestionCapacidad.Application.Abstractions;

public interface IUseCase<TResponse>
{
    Task<TResponse> ExecuteAsync(CancellationToken cancellationToken = default);
}

public interface IUseCase<in TRequest, TResponse>
{
    Task<TResponse> ExecuteAsync(TRequest request, CancellationToken cancellationToken = default);
}

public interface ICommandUseCase<in TRequest>
{
    Task ExecuteAsync(TRequest request, CancellationToken cancellationToken = default);
}
