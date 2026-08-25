using FluentValidation;

namespace GestionCapacidad.Application.UseCases.Companies.UpdateCompany;

public sealed class UpdateCompanyValidator : AbstractValidator<UpdateCompanyRequest>
{
    public UpdateCompanyValidator()
    {
        RuleFor(request => request.Id)
            .NotEmpty();

        RuleFor(request => request.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(request => request.IdentificationNumber)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(request => request.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(250);
    }
}
