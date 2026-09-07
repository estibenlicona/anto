using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Skills.CreateSkill;
using GestionCapacidad.Application.UseCases.Skills.DeleteSkill;
using GestionCapacidad.Application.UseCases.Skills.GetSkillsCatalog;
using GestionCapacidad.Application.UseCases.Skills.SetSkillActive;
using GestionCapacidad.Application.UseCases.Skills.SetSkillCriteria;
using GestionCapacidad.Application.UseCases.Skills.SetSkillExpectation;
using GestionCapacidad.Application.UseCases.Skills.UpdateSkill;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class SkillUseCaseTests
{
    private readonly Mock<ISkillRepository> _skills = new();
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<IAssessmentRepository> _assessments = new();
    private readonly Mock<ISingleDocumentRepository<SkillCatalogVersion>> _version = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private readonly Person _dataEngineer = TestDataFactory.CreatePerson(position: "Data Engineer");

    public SkillUseCaseTests()
    {
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_dataEngineer]);
        _version.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((SkillCatalogVersion?)null);
        _assessments.Setup(r => r.ExistsUsingClosedSkillAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);
    }

    private Skill NewSkill(string name = "SQL") => new(name, SkillGroup.Technical, "d");

    private void Have(Skill skill)
    {
        _skills.Setup(r => r.GetByIdAsync(skill.Id, It.IsAny<CancellationToken>())).ReturnsAsync(skill);
    }

    // ── GetSkillsCatalog ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetSkillsCatalog_ReturnsVersionAndAllSkills()
    {
        var skill = NewSkill();
        _skills.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([skill]);
        var useCase = new GetSkillsCatalogUseCase(_skills.Object, _people.Object, _version.Object);

        GetSkillsCatalogResponse response = await useCase.ExecuteAsync();

        Assert.Equal(1, response.Catalog.Version);
        Assert.Single(response.Catalog.Skills);
    }

    // ── CreateSkill ───────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateSkill_WithDuplicateName_Throws400()
    {
        _skills.Setup(r => r.ExistsByNameAsync("SQL", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var useCase = new CreateSkillUseCase(
            _skills.Object, _people.Object, _version.Object, _unitOfWork.Object, new CreateSkillValidator());

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new CreateSkillRequest("SQL", "technical", "d")));
    }

    [Fact]
    public async Task CreateSkill_Valid_NacesActive_WithFourEmptyLevels()
    {
        var useCase = new CreateSkillUseCase(
            _skills.Object, _people.Object, _version.Object, _unitOfWork.Object, new CreateSkillValidator());

        CreateSkillResponse response = await useCase.ExecuteAsync(new CreateSkillRequest("SQL", "technical", "d"));

        Assert.True(response.Skill.Active);
        Assert.Equal(4, response.Skill.Levels.Count);
        _skills.Verify(r => r.AddAsync(It.IsAny<Skill>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateSkill_WithInvalidGroup_Throws400()
    {
        var useCase = new CreateSkillUseCase(
            _skills.Object, _people.Object, _version.Object, _unitOfWork.Object, new CreateSkillValidator());

        await Assert.ThrowsAsync<ValidationException>(() =>
            useCase.ExecuteAsync(new CreateSkillRequest("SQL", "soft", "d")));
    }

    // ── UpdateSkill ───────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateSkill_RenamingToAnotherExistingName_Throws()
    {
        Skill skill = NewSkill("SQL");
        Have(skill);
        _skills.Setup(r => r.ExistsByNameAsync("Python", skill.Id, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var useCase = new UpdateSkillUseCase(
            _skills.Object, _people.Object, _version.Object, _unitOfWork.Object, new UpdateSkillValidator());

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new UpdateSkillRequest(skill.Id, "Python", "technical", "d")));
    }

    [Fact]
    public async Task UpdateSkill_RenamingToItsOwnCurrentName_DoesNotThrow()
    {
        Skill skill = NewSkill("SQL");
        Have(skill);
        _skills.Setup(r => r.ExistsByNameAsync("SQL", skill.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var useCase = new UpdateSkillUseCase(
            _skills.Object, _people.Object, _version.Object, _unitOfWork.Object, new UpdateSkillValidator());

        UpdateSkillResponse response = await useCase.ExecuteAsync(new UpdateSkillRequest(skill.Id, "SQL", "technical", "d2"));

        Assert.Equal("d2", response.Skill.Description);
    }

    // ── DeleteSkill ───────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteSkill_WithUnknownId_Throws404()
    {
        var useCase = new DeleteSkillUseCase(_skills.Object, _assessments.Object, _version.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            useCase.ExecuteAsync(new DeleteSkillRequest(Guid.NewGuid())));
    }

    [Fact]
    public async Task DeleteSkill_UsedByAClosedAssessment_Throws400()
    {
        Skill skill = NewSkill();
        Have(skill);
        _assessments.Setup(r => r.ExistsUsingClosedSkillAsync(skill.Id, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var useCase = new DeleteSkillUseCase(_skills.Object, _assessments.Object, _version.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<BadRequestException>(() => useCase.ExecuteAsync(new DeleteSkillRequest(skill.Id)));
    }

    [Fact]
    public async Task DeleteSkill_NotUsedByAnyClosedAssessment_Succeeds()
    {
        Skill skill = NewSkill();
        Have(skill);
        var useCase = new DeleteSkillUseCase(_skills.Object, _assessments.Object, _version.Object, _unitOfWork.Object);

        await useCase.ExecuteAsync(new DeleteSkillRequest(skill.Id));

        _skills.Verify(r => r.Delete(skill), Times.Once);
    }

    // ── SetSkillActive ────────────────────────────────────────────────────────

    [Fact]
    public async Task SetSkillActive_TogglesTheFlag()
    {
        Skill skill = NewSkill();
        Have(skill);
        var useCase = new SetSkillActiveUseCase(_skills.Object, _people.Object, _version.Object, _unitOfWork.Object);

        SetSkillActiveResponse response = await useCase.ExecuteAsync(new SetSkillActiveCommand(skill.Id, false));

        Assert.False(response.Skill.Active);
    }

    // ── SetSkillExpectation ───────────────────────────────────────────────────

    [Fact]
    public async Task SetSkillExpectation_WithUnknownPosition_Throws400()
    {
        Skill skill = NewSkill();
        Have(skill);
        var useCase = new SetSkillExpectationUseCase(_skills.Object, _people.Object, _version.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new SetSkillExpectationRequest(skill.Id, "Nonexistent Role", 3)));
    }

    [Fact]
    public async Task SetSkillExpectation_WithNullLevel_RemovesTheExpectation()
    {
        Skill skill = NewSkill();
        skill.SetExpectation("Data Engineer", 3);
        Have(skill);
        var useCase = new SetSkillExpectationUseCase(_skills.Object, _people.Object, _version.Object, _unitOfWork.Object);

        SetSkillExpectationResponse response = await useCase.ExecuteAsync(
            new SetSkillExpectationRequest(skill.Id, "Data Engineer", null));

        Assert.Null(response.Skill.Expectations.Single(e => e.Position == "Data Engineer").Level);
    }

    [Fact]
    public async Task SetSkillExpectation_WithLevelOutOfRange_Throws400()
    {
        Skill skill = NewSkill();
        Have(skill);
        var useCase = new SetSkillExpectationUseCase(_skills.Object, _people.Object, _version.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new SetSkillExpectationRequest(skill.Id, "Data Engineer", 5)));
    }

    // ── SetSkillCriteria ──────────────────────────────────────────────────────

    [Fact]
    public async Task SetSkillCriteria_WithInvalidRouteLevel_Throws400()
    {
        Skill skill = NewSkill();
        Have(skill);
        var useCase = new SetSkillCriteriaUseCase(_skills.Object, _people.Object, _version.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new SetSkillCriteriaRequest(skill.Id, 5, ["A"])));
    }

    [Fact]
    public async Task SetSkillCriteria_WithEmptyCriterion_Throws400()
    {
        Skill skill = NewSkill();
        Have(skill);
        var useCase = new SetSkillCriteriaUseCase(_skills.Object, _people.Object, _version.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new SetSkillCriteriaRequest(skill.Id, 2, ["A", "  "])));
    }

    [Fact]
    public async Task SetSkillCriteria_Valid_ReplacesTheWholeList()
    {
        Skill skill = NewSkill();
        skill.ReplaceCriteria(2, ["Old"]);
        Have(skill);
        var useCase = new SetSkillCriteriaUseCase(_skills.Object, _people.Object, _version.Object, _unitOfWork.Object);

        SetSkillCriteriaResponse response = await useCase.ExecuteAsync(
            new SetSkillCriteriaRequest(skill.Id, 2, ["New1", "New2"]));

        Assert.Equal(["New1", "New2"], response.Skill.Levels.Single(l => l.Level == 2).Criteria);
    }
}
