using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Billing;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Billing.RegisterPrefactureDocument;

public sealed record RegisterPrefactureDocumentRequest(Guid Id, RegisterPrefactureRequest Document);

public sealed record RegisterPrefactureDocumentResponse(PrefactureDto Prefacture);

/// <summary>
/// Registra el documento recibido del proveedor. Las guardas —una sola vez
/// por período, salvo corrigiendo una objetada; nunca sobre una aprobada—
/// viven en el agregado y se traducen a 400 acá.
/// </summary>
public sealed class RegisterPrefactureDocumentUseCase(
    IPrefactureRepository prefactureRepository,
    IPersonRepository personRepository,
    ICompanyRepository companyRepository,
    IAllocationRepository allocationRepository,
    ISquadRepository squadRepository,
    IAbsenceRepository absenceRepository,
    IUnitOfWork unitOfWork) : IUseCase<RegisterPrefactureDocumentRequest, RegisterPrefactureDocumentResponse>
{
    public async Task<RegisterPrefactureDocumentResponse> ExecuteAsync(
        RegisterPrefactureDocumentRequest request,
        CancellationToken cancellationToken = default)
    {
        Prefacture? prefacture = await prefactureRepository.GetByIdAsync(request.Id, cancellationToken);
        if (prefacture is null)
        {
            throw new NotFoundException("Prefactura no encontrada");
        }

        RegisterPrefactureRequest body = request.Document;

        try
        {
            var currency = Currency.From(body.Currency);
            var imputation = new Imputation(
                body.Imputation.CostObject,
                body.Imputation.Concept,
                body.Imputation.AccountName,
                body.Imputation.AccountNumber,
                body.Imputation.CostCenter,
                body.Imputation.PurchaseOrder,
                body.Imputation.PaymentAccount);
            var document = new PrefactureDocument(body.Number, body.ReceivedAt, body.Amount, currency, imputation);

            prefacture.RegisterDocument(document);
        }
        catch (DomainException exception)
        {
            throw new BadRequestException(exception.Message);
        }

        prefactureRepository.Update(prefacture);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        BillingContext context = await BillingContext.BuildAsync(
            personRepository, companyRepository, allocationRepository, squadRepository, absenceRepository, cancellationToken);

        return new RegisterPrefactureDocumentResponse(context.ToDto(prefacture));
    }
}
