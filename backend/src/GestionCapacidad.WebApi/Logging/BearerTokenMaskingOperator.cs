using Serilog.Enrichers.Sensitive;

namespace GestionCapacidad.WebApi.Logging;

public sealed class BearerTokenMaskingOperator : RegexMaskingOperator
{
    public BearerTokenMaskingOperator()
        : base(@"(?i)(\b(?:Authorization\s*:\s*)?Bearer\s+)([A-Za-z0-9._~+/=-]+)")
    {
    }

    protected override string PreprocessMask(string mask, System.Text.RegularExpressions.Match match)
        => "${1}" + mask;
}
