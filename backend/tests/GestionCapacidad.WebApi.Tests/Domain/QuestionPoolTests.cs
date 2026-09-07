using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class QuestionPoolTests
{
    private static PoolQuestion Question(int position, string code, int peso = 2) =>
        new(position, code, QuestionDimension.NegocioYCliente, $"¿Texto de {code}?", peso);

    [Fact]
    public void Create_WithValidQuestions_KeepsOrder()
    {
        var pool = new QuestionPool([Question(0, "N1"), Question(1, "N2")]);

        Assert.Equal(["N1", "N2"], pool.Questions.Select(q => q.Code));
    }

    [Fact]
    public void Create_OrdersQuestionsByPosition_NotByArrivalOrder()
    {
        var pool = new QuestionPool([Question(1, "N2"), Question(0, "N1")]);

        Assert.Equal(["N1", "N2"], pool.Questions.Select(q => q.Code));
    }

    [Fact]
    public void Create_WithEmptyList_IsValid()
    {
        Assert.Empty(new QuestionPool([]).Questions);
    }

    [Fact]
    public void Create_WithRepeatedCode_Throws()
    {
        var exception = Assert.Throws<DomainException>(() =>
            new QuestionPool([Question(0, "N1"), Question(1, "N1")]));

        Assert.Contains("N1", exception.Message);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Question_WithPesoBelowOne_Throws(int peso)
    {
        var exception = Assert.Throws<DomainException>(() => Question(0, "N9", peso));

        Assert.Contains("N9", exception.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Question_WithBlankText_Throws(string texto)
    {
        Assert.Throws<DomainException>(() =>
            new PoolQuestion(0, "N1", QuestionDimension.NegocioYCliente, texto, 2));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Question_WithBlankCode_Throws(string code)
    {
        Assert.Throws<DomainException>(() =>
            new PoolQuestion(0, code, QuestionDimension.NegocioYCliente, "¿Texto?", 2));
    }

    [Fact]
    public void Question_WithUnknownDimension_ThrowsWhenBuildingTheValueObject()
    {
        Assert.Throws<DomainException>(() => QuestionDimension.From("Dimensión inventada"));
    }

    [Fact]
    public void Question_TrimsCodeAndText()
    {
        var question = new PoolQuestion(0, "  N1  ", QuestionDimension.Integraciones, "  ¿Texto?  ", 3);

        Assert.Equal("N1", question.Code);
        Assert.Equal("¿Texto?", question.Texto);
        Assert.Equal(QuestionDimension.Integraciones, question.Dimension);
    }

    [Fact]
    public void Replace_WithValidQuestions_MarksUpdated()
    {
        var pool = new QuestionPool([Question(0, "N1"), Question(1, "N2")]);

        pool.Replace([Question(0, "N1")]);

        Assert.Equal(["N1"], pool.Questions.Select(q => q.Code));
        Assert.NotNull(pool.UpdatedAtUtc);
    }
}
