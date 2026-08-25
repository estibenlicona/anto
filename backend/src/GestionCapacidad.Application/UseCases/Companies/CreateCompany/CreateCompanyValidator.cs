using FluentValidation;

namespace GestionCapacidad.Application.UseCases.Companies.CreateCompany;

public sealed class CreateCompanyValidator : AbstractValidator<CreateCompanyRequest>
{
    public CreateCompanyValidator()
    {
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
