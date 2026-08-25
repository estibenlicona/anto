using Serilog.Enrichers.Sensitive;

namespace GestionCapacidad.WebApi.Logging;

public sealed class QueryStringSecretMaskingOperator : RegexMaskingOperator
{
    public QueryStringSecretMaskingOperator()
        : base(@"(?i)(\b(?:client_secret|access_token|refresh_token|password|pwd|api_key|subscription_key|clientSecret|accessToken|refreshToken|apiKey|subscriptionKey|Ocp-Apim-Subscription-Key)\s*[:=]\s*)([^&;\s]+)")
    {
    }

    protected override string PreprocessMask(string mask, System.Text.RegularExpressions.Match match)
        => "${1}" + mask;
}
