using Serilog.Enrichers.Sensitive;

namespace GestionCapacidad.WebApi.Logging;

public sealed class ConnectionStringSecretMaskingOperator : RegexMaskingOperator
{
    public ConnectionStringSecretMaskingOperator()
        : base(@"(?i)(\b(?:Password|Pwd|AccountKey|SharedAccessKey)\s*=\s*)([^;]+)")
    {
    }

    protected override string PreprocessMask(string mask, System.Text.RegularExpressions.Match match)
        => "${1}" + mask;
}
