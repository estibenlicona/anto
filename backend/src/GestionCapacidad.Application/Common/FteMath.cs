namespace GestionCapacidad.Application.Common;

/// <summary>
/// Las cuentas de FTE que comparten los módulos que agregan capacidad —hoy
/// Células; la Torre de control y las Líneas de expertise responderán la misma
/// pregunta—. Viven acá y no copiadas en cada use case porque si cada pantalla
/// tuviera su propia fórmula, discreparían en cuanto una cambiara.
///
/// Ojo con la asimetría, que es deliberada (viene del mock): el FTE asignado
/// suma Σ dedicación/100 y <b>no</b> mira el <c>availableFte</c> de la persona
/// — alguien de 0.8 asignado al 100 % aporta 1.0. Como el disponible sí suma
/// <c>availableFte</c>, el asignado puede superar al disponible, y una célula
/// de gente part-time lee "al tope" fácilmente.
/// </summary>
public static class FteMath
{
    /// <summary>Un decimal, que es la precisión con la que se muestra el FTE.</summary>
    public static double Round1(double value) => Math.Round(value * 10) / 10;

    /// <summary>Σ porcentaje/100, a un decimal — dedicación, BAU o Transformación.</summary>
    public static double FteOfPercentages(IEnumerable<int> percentages) =>
        Round1(percentages.Sum(p => p / 100d));

    /// <summary>FTE disponible de un conjunto de personas: la suma de lo que cada una declara.</summary>
    public static double AvailableFteOf(IEnumerable<float> availableFtes) =>
        Round1(availableFtes.Sum(f => (double)f));
}
