namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// La imputación contable del documento del proveedor: 7 campos de texto,
/// cada uno con contenido o ausente — nunca cadena vacía, que es la
/// diferencia entre "no llegó" y "llegó en blanco".
/// </summary>
public sealed record Imputation
{
    public string? CostObject { get; }

    public string? Concept { get; }

    public string? AccountName { get; }

    public string? AccountNumber { get; }

    public string? CostCenter { get; }

    public string? PurchaseOrder { get; }

    public string? PaymentAccount { get; }

    public Imputation(
        string? costObject,
        string? concept,
        string? accountName,
        string? accountNumber,
        string? costCenter,
        string? purchaseOrder,
        string? paymentAccount)
    {
        CostObject = Normalize(costObject);
        Concept = Normalize(concept);
        AccountName = Normalize(accountName);
        AccountNumber = Normalize(accountNumber);
        CostCenter = Normalize(costCenter);
        PurchaseOrder = Normalize(purchaseOrder);
        PaymentAccount = Normalize(paymentAccount);
    }

    public static readonly Imputation Empty = new(null, null, null, null, null, null, null);

    private static string? Normalize(string? value)
    {
        if (value is null)
        {
            return null;
        }

        string trimmed = value.Trim();
        return trimmed.Length == 0 ? null : trimmed;
    }
}
