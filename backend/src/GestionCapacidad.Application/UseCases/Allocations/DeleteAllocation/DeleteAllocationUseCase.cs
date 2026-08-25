using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Allocations.DeleteAllocation;

public sealed class DeleteAllocationUseCase(
    IAllocationRepository allocationRepository,
    IUnitOfWork unitOfWork) : ICommandUseCase<DeleteAllocationRequest>
{
    public async Task ExecuteAsync(DeleteAllocationRequest request, CancellationToken cancellationToken = default)
    {
        Allocation? allocation = await allocationRepository.GetByIdAsync(request.Id, cancellationToken);
        if (allocation is null)
            throw new NotFoundException($"Allocation with id '{request.Id}' was not found.");

        allocationRepository.Delete(allocation);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
