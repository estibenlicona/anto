using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Companies.DeleteCompany;

public sealed class DeleteCompanyUseCase(ICompanyRepository companyRepository, IUnitOfWork unitOfWork) : ICommandUseCase<DeleteCompanyRequest>
{
    public async Task ExecuteAsync(DeleteCompanyRequest request, CancellationToken cancellationToken = default)
    {
        Company? company = await companyRepository.GetByIdAsync(request.Id, cancellationToken);
        if (company is null || !company.IsActive)
        {
            throw new NotFoundException("Company was not found.");
        }

        company.Deactivate();

        companyRepository.Update(company);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
