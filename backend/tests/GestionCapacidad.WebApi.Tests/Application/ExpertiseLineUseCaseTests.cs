using GestionCapacidad.Application.UseCases.ExpertiseLines.AddExpertiseLinePeople;
using GestionCapacidad.Application.UseCases.ExpertiseLines.ArchiveExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.CreateExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.GetExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.GetExpertiseLines;
using GestionCapacidad.Application.UseCases.ExpertiseLines.GetExpertiseRoster;
using GestionCapacidad.Application.UseCases.ExpertiseLines.ReactivateExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.RemoveExpertiseLinePerson;
using GestionCapacidad.Application.UseCases.ExpertiseLines.SetExpertiseLineLead;
using GestionCapacidad.Application.UseCases.ExpertiseLines.UpdateExpertiseLine;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class ExpertiseLineUseCaseTests
{
    private readonly Mock<IExpertiseLineRepository> _lines = new();
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<IAllocationRepository> _allocations = new();
    private readonly Mock<ISquadRepository> _squads = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public ExpertiseLineUseCaseTests()
    {
        _lines.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<ExpertiseLine>());
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Person>());
        _allocations.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Allocation>());
        _squads.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Squad>());
    }

    [Fact]
    public async Task GetExpertiseLine_WithUnknownId_Throws404()
    {
        var useCase = new GetExpertiseLineUseCase(_lines.Object, _people.Object, _allocations.Object, _squads.Object);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            useCase.ExecuteAsync(new GetExpertiseLineRequest(Guid.NewGuid())));
    }

    [Fact]
    public async Task GetExpertiseLine_WithoutPeople_RespondsEmptyPeopleAndZeroCapacity()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        _lines.Setup(r => r.GetByIdAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(line);
        _people.Setup(r => r.GetByExpertiseLineAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Person>());
        var useCase = new GetExpertiseLineUseCase(_lines.Object, _people.Object, _allocations.Object, _squads.Object);

        GetExpertiseLineResponse response = await useCase.ExecuteAsync(new GetExpertiseLineRequest(line.Id));

        Assert.Empty(response.Line.People);
        Assert.Equal(0, response.Line.Capacity.PeopleCount);
        Assert.Equal(0, response.Line.Capacity.AvailableFte);
    }

    [Fact]
    public async Task GetExpertiseLine_MarksTheLeadInThePeopleList()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        Person lead = TestDataFactory.CreatePerson(name: "María González");
        Person member = TestDataFactory.CreatePerson(name: "Carlos López");
        line.SetLead(lead.Id);
        _lines.Setup(r => r.GetByIdAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(line);
        _people.Setup(r => r.GetByExpertiseLineAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync([lead, member]);
        _people.Setup(r => r.GetByIdAsync(lead.Id, It.IsAny<CancellationToken>())).ReturnsAsync(lead);
        var useCase = new GetExpertiseLineUseCase(_lines.Object, _people.Object, _allocations.Object, _squads.Object);

        GetExpertiseLineResponse response = await useCase.ExecuteAsync(new GetExpertiseLineRequest(line.Id));

        Assert.True(response.Line.People.Single(p => p.Id == lead.Id).IsLead);
        Assert.False(response.Line.People.Single(p => p.Id == member.Id).IsLead);
        Assert.Equal(lead.Name, response.Line.Lead!.Name);
    }

    [Fact]
    public async Task GetExpertiseLines_ReturnsAllLinesWithTheirPeopleCount()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        Person member = TestDataFactory.CreatePerson(name: "Carlos López");
        member.AssignToExpertiseLine(line.Id);
        _lines.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([line]);
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([member]);
        var useCase = new GetExpertiseLinesUseCase(_lines.Object, _people.Object);

        GetExpertiseLinesResponse response = await useCase.ExecuteAsync();

        Assert.Equal(1, Assert.Single(response.Lines).PeopleCount);
    }

    private CreateExpertiseLineUseCase NewCreateUseCase() => new(_lines.Object, _unitOfWork.Object);

    [Fact]
    public async Task CreateExpertiseLine_WithDuplicateActiveName_Throws400()
    {
        _lines.Setup(r => r.ExistsByNameAsync("Backend", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            NewCreateUseCase().ExecuteAsync(new CreateExpertiseLineRequest("Backend", "BE", null)));
    }

    [Fact]
    public async Task CreateExpertiseLine_WithDuplicateCode_Throws400()
    {
        _lines.Setup(r => r.ExistsByCodeAsync("BE", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            NewCreateUseCase().ExecuteAsync(new CreateExpertiseLineRequest("Backend", "BE", null)));
    }

    [Fact]
    public async Task CreateExpertiseLine_NormalizesCodeToUpperCase()
    {
        CreateExpertiseLineResponse response = await NewCreateUseCase().ExecuteAsync(
            new CreateExpertiseLineRequest("Backend", "be", null));

        Assert.Equal("BE", response.Line.Code);
        Assert.Equal("Active", response.Line.Status);
    }

    [Fact]
    public async Task UpdateExpertiseLine_WithUnknownId_Throws404()
    {
        var useCase = new UpdateExpertiseLineUseCase(_lines.Object, _people.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            useCase.ExecuteAsync(new UpdateExpertiseLineRequest(Guid.NewGuid(), "Backend", "BE", null)));
    }

    [Fact]
    public async Task UpdateExpertiseLine_EditingWithoutChangingNameOrCode_DoesNotFalselyTrigger400()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        _lines.Setup(r => r.GetByIdAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(line);
        _lines.Setup(r => r.ExistsByNameAsync("Backend", line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _lines.Setup(r => r.ExistsByCodeAsync("BE", line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _people.Setup(r => r.GetByExpertiseLineAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Person>());
        var useCase = new UpdateExpertiseLineUseCase(_lines.Object, _people.Object, _unitOfWork.Object);

        UpdateExpertiseLineResponse response = await useCase.ExecuteAsync(
            new UpdateExpertiseLineRequest(line.Id, "Backend", "BE", "Descripción nueva"));

        Assert.Equal("Backend", response.Line.Name);
        Assert.Equal("Descripción nueva", line.Description);
    }

    [Fact]
    public async Task ArchiveExpertiseLine_WithPeople_Throws400WithTheCount()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        Person member = TestDataFactory.CreatePerson(name: "Carlos López");
        _lines.Setup(r => r.GetByIdAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(line);
        _people.Setup(r => r.GetByExpertiseLineAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync([member]);
        var useCase = new ArchiveExpertiseLineUseCase(_lines.Object, _people.Object, _unitOfWork.Object);

        BadRequestException exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new ArchiveExpertiseLineRequest(line.Id)));

        Assert.Contains("1", exception.Message);
    }

    [Fact]
    public async Task ArchiveExpertiseLine_WithoutPeople_ArchivesIt()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        _lines.Setup(r => r.GetByIdAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(line);
        _people.Setup(r => r.GetByExpertiseLineAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Person>());
        var useCase = new ArchiveExpertiseLineUseCase(_lines.Object, _people.Object, _unitOfWork.Object);

        ArchiveExpertiseLineResponse response = await useCase.ExecuteAsync(new ArchiveExpertiseLineRequest(line.Id));

        Assert.Equal("Archived", response.Line.Status);
    }

    [Fact]
    public async Task ReactivateExpertiseLine_AnActiveLine_Throws400()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        _lines.Setup(r => r.GetByIdAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(line);
        var useCase = new ReactivateExpertiseLineUseCase(_lines.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new ReactivateExpertiseLineRequest(line.Id)));
    }

    [Fact]
    public async Task ReactivateExpertiseLine_AnArchivedLine_MakesItActiveWithoutTouchingNameOrCode()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        line.Archive();
        _lines.Setup(r => r.GetByIdAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(line);
        var useCase = new ReactivateExpertiseLineUseCase(_lines.Object, _unitOfWork.Object);

        ReactivateExpertiseLineResponse response = await useCase.ExecuteAsync(new ReactivateExpertiseLineRequest(line.Id));

        Assert.Equal("Active", response.Line.Status);
        Assert.Equal("Backend", response.Line.Name);
        Assert.Equal("BE", response.Line.Code);
    }

    private SetExpertiseLineLeadUseCase NewSetLeadUseCase() =>
        new(_lines.Object, _people.Object, _allocations.Object, _squads.Object, _unitOfWork.Object);

    [Fact]
    public async Task SetExpertiseLineLead_DesignatingSomeoneWhoLedAnotherLine_ClearsTheOtherLinesLead()
    {
        var lineA = new ExpertiseLine("Backend", "BE", null);
        var lineB = new ExpertiseLine("Frontend", "FE", null);
        Person person = TestDataFactory.CreatePerson(name: "María González");
        lineB.SetLead(person.Id);

        _lines.Setup(r => r.GetByIdAsync(lineA.Id, It.IsAny<CancellationToken>())).ReturnsAsync(lineA);
        _lines.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([lineA, lineB]);
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _people.Setup(r => r.GetByExpertiseLineAsync(lineA.Id, It.IsAny<CancellationToken>())).ReturnsAsync([person]);

        await NewSetLeadUseCase().ExecuteAsync(new SetExpertiseLineLeadRequest(lineA.Id, person.Id));

        Assert.Equal(person.Id, lineA.LeadId);
        Assert.Null(lineB.LeadId);
        Assert.Equal(lineA.Id, person.ExpertiseLineId);
    }

    [Fact]
    public async Task SetExpertiseLineLead_RemovingTheLead_KeepsThePersonInTheLine()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        Person lead = TestDataFactory.CreatePerson(name: "María González");
        lead.AssignToExpertiseLine(line.Id);
        line.SetLead(lead.Id);

        _lines.Setup(r => r.GetByIdAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(line);
        _people.Setup(r => r.GetByExpertiseLineAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync([lead]);

        SetExpertiseLineLeadResponse response = await NewSetLeadUseCase().ExecuteAsync(
            new SetExpertiseLineLeadRequest(line.Id, null));

        Assert.Null(response.Line.Lead);
        Assert.Equal(line.Id, lead.ExpertiseLineId);
    }

    private AddExpertiseLinePeopleUseCase NewAddPeopleUseCase() =>
        new(_lines.Object, _people.Object, _allocations.Object, _squads.Object, _unitOfWork.Object);

    private RemoveExpertiseLinePersonUseCase NewRemovePersonUseCase() =>
        new(_lines.Object, _people.Object, _allocations.Object, _squads.Object, _unitOfWork.Object);

    [Fact]
    public async Task AddExpertiseLinePeople_MovesSomeoneWhoWasInAnotherLine()
    {
        var lineA = new ExpertiseLine("Backend", "BE", null);
        var otherLineId = Guid.NewGuid();
        Person person = TestDataFactory.CreatePerson(name: "Carlos López");
        person.AssignToExpertiseLine(otherLineId);

        _lines.Setup(r => r.GetByIdAsync(lineA.Id, It.IsAny<CancellationToken>())).ReturnsAsync(lineA);
        _people.Setup(r => r.GetByIdAsync(person.Id, It.IsAny<CancellationToken>())).ReturnsAsync(person);
        _people.Setup(r => r.GetByExpertiseLineAsync(lineA.Id, It.IsAny<CancellationToken>())).ReturnsAsync([person]);

        AddExpertiseLinePeopleResponse response = await NewAddPeopleUseCase().ExecuteAsync(
            new AddExpertiseLinePeopleRequest(lineA.Id, [person.Id]));

        Assert.Equal(lineA.Id, person.ExpertiseLineId);
        Assert.Single(response.Line.People);
    }

    [Fact]
    public async Task AddExpertiseLinePeople_WithUnknownPerson_Throws404()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        _lines.Setup(r => r.GetByIdAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(line);
        _people.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Person?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            NewAddPeopleUseCase().ExecuteAsync(new AddExpertiseLinePeopleRequest(line.Id, [Guid.NewGuid()])));
    }

    [Fact]
    public async Task RemoveExpertiseLinePerson_TheLead_Throws400()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        Person lead = TestDataFactory.CreatePerson(name: "María González");
        lead.AssignToExpertiseLine(line.Id);
        line.SetLead(lead.Id);
        _lines.Setup(r => r.GetByIdAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(line);
        _people.Setup(r => r.GetByIdAsync(lead.Id, It.IsAny<CancellationToken>())).ReturnsAsync(lead);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            NewRemovePersonUseCase().ExecuteAsync(new RemoveExpertiseLinePersonRequest(line.Id, lead.Id)));
    }

    [Fact]
    public async Task RemoveExpertiseLinePerson_ARegularMember_RemovesThemFromTheLine()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        Person member = TestDataFactory.CreatePerson(name: "Carlos López");
        member.AssignToExpertiseLine(line.Id);
        _lines.Setup(r => r.GetByIdAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(line);
        _people.Setup(r => r.GetByIdAsync(member.Id, It.IsAny<CancellationToken>())).ReturnsAsync(member);
        _people.Setup(r => r.GetByExpertiseLineAsync(line.Id, It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Person>());

        await NewRemovePersonUseCase().ExecuteAsync(new RemoveExpertiseLinePersonRequest(line.Id, member.Id));

        Assert.Null(member.ExpertiseLineId);
    }

    [Fact]
    public async Task GetExpertiseRoster_PersonWithoutLine_RespondsLineNull()
    {
        Person unassigned = TestDataFactory.CreatePerson(name: "Sin Línea");
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([unassigned]);
        var useCase = new GetExpertiseRosterUseCase(_people.Object, _lines.Object);

        GetExpertiseRosterResponse response = await useCase.ExecuteAsync();

        Assert.Null(Assert.Single(response.People).Line);
    }

    [Fact]
    public async Task GetExpertiseRoster_PersonWithLine_ResolvesTheLineName()
    {
        var line = new ExpertiseLine("Backend", "BE", null);
        Person member = TestDataFactory.CreatePerson(name: "Carlos López");
        member.AssignToExpertiseLine(line.Id);
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([member]);
        _lines.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([line]);
        var useCase = new GetExpertiseRosterUseCase(_people.Object, _lines.Object);

        GetExpertiseRosterResponse response = await useCase.ExecuteAsync();

        Assert.Equal("Backend", Assert.Single(response.People).Line!.Name);
    }
}
