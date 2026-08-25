using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// Escala de seniority propia de Tuya (4 niveles), la misma escala que antes
/// se llamaba "nivel SFIA" — no existe una escalera de seniority separada.
/// Nivel 1 = Principiante, Nivel 2 = Competente, Nivel 3 = Avanzado, Nivel 4 = Experto.
/// </summary>
public sealed record Seniority
{
    public const int Min = 1;
    public const int Max = 4;

    /// <summary>Nivel 1 — Principiante. Conocimiento básico, requiere guía constante.</summary>
    public static readonly Seniority Principiante = new(1);

    /// <summary>Nivel 2 — Competente. Trabaja con supervisión ocasional.</summary>
    public static readonly Seniority Competente = new(2);

    /// <summary>Nivel 3 — Avanzado. Autónomo, resuelve problemas complejos.</summary>
    public static readonly Seniority Avanzado = new(3);

    /// <summary>Nivel 4 — Experto. Referente técnico, guía a otros.</summary>
    public static readonly Seniority Experto = new(4);

    public int Value { get; }

    public string Label => Value switch
    {
        1 => "Principiante",
        2 => "Competente",
        3 => "Avanzado",
        4 => "Experto",
        _ => "Desconocido"
    };

    private Seniority(int value) => Value = value;

    public static Seniority From(int value)
    {
        if (value < Min || value > Max)
        {
            throw new DomainException(
                $"El seniority debe estar entre {Min} y {Max} (escala Tuya). " +
                $"1=Principiante, 2=Competente, 3=Avanzado, 4=Experto. Recibido: {value}.");
        }

        return new Seniority(value);
    }

    public override string ToString() => $"{Value} - {Label}";
}
