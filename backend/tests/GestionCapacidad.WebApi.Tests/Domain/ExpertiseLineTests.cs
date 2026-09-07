using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class ExpertiseLineTests
{
    [Fact]
    public void Ctor_NacesActiveWithoutLead()
    {
        var line = new ExpertiseLine("Backend", "BE", null);

        Assert.Equal(ExpertiseLineStatus.Active, line.Status);
        Assert.Null(line.LeadId);
    }

    [Fact]
    public void Ctor_NormalizesCodeToUpperCase()
    {
        var line = new ExpertiseLine("Backend", "be", null);

        Assert.Equal("BE", line.Code);
    }

    [Theory]
    [InlineData("", "BE")]
    [InlineData("Backend", "")]
    public void Ctor_WithEmptyNameOrCode_Throws(string name, string code)
    {
        Assert.Throws<DomainException>(() => new ExpertiseLine(name, code, null));
    }

    [Fact]
    public void Ctor_WithNameOverLimit_Throws()
    {
        Assert.Throws<DomainException>(() => new ExpertiseLine(new string('a', 101), "BE", null));
    }

    [Fact]
    public void Ctor_WithCodeOverLimit_Throws()
    {
        Assert.Throws<DomainException>(() => new ExpertiseLine("Backend", new string('a', 11), null));
    }

    [Fact]
    public void Ctor_WithDescriptionOverLimit_Throws()
    {
        Assert.Throws<DomainException>(() => new ExpertiseLine("Backend", "BE", new string('a', 201)));
    }

    [Fact]
    public void Archive_Twice_Throws()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        line.Archive();

        Assert.Throws<DomainException>(line.Archive);
    }

    [Fact]
    public void Reactivate_AnActiveLine_Throws()
    {
        var line = new ExpertiseLine("Backend", "BE", null);

        Assert.Throws<DomainException>(line.Reactivate);
    }

    [Fact]
    public void Reactivate_AnArchivedLine_MakesItActiveAgain()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        line.Archive();

        line.Reactivate();

        Assert.Equal(ExpertiseLineStatus.Active, line.Status);
    }

    [Fact]
    public void SetLead_UpdatesLeadId()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        Guid leadId = Guid.NewGuid();

        line.SetLead(leadId);

        Assert.Equal(leadId, line.LeadId);

        line.SetLead(null);

        Assert.Null(line.LeadId);
    }
}
