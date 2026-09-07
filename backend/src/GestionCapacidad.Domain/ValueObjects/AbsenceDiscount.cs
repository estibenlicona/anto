namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// El descuento por ausencias aprobadas de una persona en un período: los
/// días hábiles ausentes que lo explican, y el monto que resulta. Nunca se
/// construye en cero — sin ausencias aprobadas, el descuento es <c>null</c>,
/// no un valor en cero.
/// </summary>
public sealed record AbsenceDiscount(decimal BusinessDays, int Amount);
