using GestionCapacidad.Application.UseCases.Assessments.CloseAssessment;
using GestionCapacidad.Application.UseCases.Assessments.GetAssessment;
using GestionCapacidad.Application.UseCases.Assessments.OpenAssessment;
using GestionCapacidad.Application.UseCases.Assessments.SaveAssessmentSkill;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Microsoft.Extensions.Time.Testing;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class AssessmentUseCaseTests
{
    private readonly Mock<IAssessmentRepository> _assessments = new();
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<ISkillRepository> _skills = new();
    private readonly Mock<ISingleDocumentRepository<SkillCatalogVersion>> _version = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeTimeProvider _timeProvider = new(new DateTimeOffset(2026, 3, 15, 0, 0, 0, TimeSpan.Zero));

    private readonly Person _paula = TestDataFactory.CreatePerson(name: "Paula Ramírez", position: "Data Engineer");

    public AssessmentUseCaseTests()
    {
        _people.Setup(r => r.GetByIdAsync(_paula.Id, It.IsAny<CancellationToken>())).ReturnsAsync(_paula);
        _skills.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Skill>());
        _version.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((SkillCatalogVersion?)null);
        _assessments.Setup(r => r.GetByPersonAndCycleAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Assessment>());
    }

    private Skill NewSkillWithExpectation(string position, int level, int? assessmentAnswerLevel = null)
    {
        var skill = new Skill("SQL", SkillGroup.Technical, "d");
        skill.ReplaceCriteria(2, ["Escribe joins"]);
        skill.SetExpectation(position, level);
        return skill;
    }

    // ── GetAssessment ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAssessment_WithUnknownPerson_Throws404()
    {
        var useCase = new GetAssessmentUseCase(_assessments.Object, _people.Object, _skills.Object, _version.Object, _timeProvider);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            useCase.ExecuteAsync(new GetAssessmentRequest(Guid.NewGuid(), null)));
    }

    [Fact]
    public async Task GetAssessment_WithoutAny_ReturnsNull()
    {
        var useCase = new GetAssessmentUseCase(_assessments.Object, _people.Object, _skills.Object, _version.Object, _timeProvider);

        GetAssessmentResponse response = await useCase.ExecuteAsync(new GetAssessmentRequest(_paula.Id, null));

        Assert.Null(response.Assessment);
    }

    [Fact]
    public async Task GetAssessment_WithInProgressAndClosed_ReturnsTheInProgress()
    {
        var closed = new Assessment(_paula.Id, "2026-S1");
        closed.Close(new Dictionary<Guid, (string, string, IReadOnlyList<IReadOnlyList<string>>, int?)>(), 1, DateTime.UtcNow);
        var inProgress = new Assessment(_paula.Id, "2026-S1");
        _assessments.Setup(r => r.GetByPersonAndCycleAsync(_paula.Id, "2026-S1", It.IsAny<CancellationToken>()))
            .ReturnsAsync([closed, inProgress]);
        var useCase = new GetAssessmentUseCase(_assessments.Object, _people.Object, _skills.Object, _version.Object, _timeProvider);

        GetAssessmentResponse response = await useCase.ExecuteAsync(new GetAssessmentRequest(_paula.Id, "2026-S1"));

        Assert.Equal("InProgress", response.Assessment!.Status);
    }

    // ── OpenAssessment ────────────────────────────────────────────────────────

    [Fact]
    public async Task OpenAssessment_FirstTime_CreatesInProgress()
    {
        var useCase = new OpenAssessmentUseCase(
            _assessments.Object, _people.Object, _skills.Object, _version.Object, _unitOfWork.Object, _timeProvider);

        OpenAssessmentResponse response = await useCase.ExecuteAsync(new OpenAssessmentRequest(_paula.Id));

        Assert.Equal("InProgress", response.Assessment.Status);
        Assert.Equal("2026-S1", response.Assessment.Cycle);
    }

    [Fact]
    public async Task OpenAssessment_WithOneAlreadyInProgress_Throws400()
    {
        var inProgress = new Assessment(_paula.Id, "2026-S1");
        _assessments.Setup(r => r.GetByPersonAndCycleAsync(_paula.Id, "2026-S1", It.IsAny<CancellationToken>()))
            .ReturnsAsync([inProgress]);
        var useCase = new OpenAssessmentUseCase(
            _assessments.Object, _people.Object, _skills.Object, _version.Object, _unitOfWork.Object, _timeProvider);

        await Assert.ThrowsAsync<BadRequestException>(() => useCase.ExecuteAsync(new OpenAssessmentRequest(_paula.Id)));
    }

    // ── SaveAssessmentSkill ───────────────────────────────────────────────────

    [Fact]
    public async Task SaveAssessmentSkill_SkillOutOfScope_Throws400()
    {
        var assessment = new Assessment(_paula.Id, "2026-S1");
        _assessments.Setup(r => r.GetByIdAsync(assessment.Id, It.IsAny<CancellationToken>())).ReturnsAsync(assessment);
        var useCase = new SaveAssessmentSkillUseCase(
            _assessments.Object, _people.Object, _skills.Object, _version.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<BadRequestException>(() => useCase.ExecuteAsync(
            new SaveAssessmentSkillCommand(_paula.Id, assessment.Id, Guid.NewGuid(), 2, [], "")));
    }

    [Fact]
    public async Task SaveAssessmentSkill_FiltersOutMadeUpCriterionText()
    {
        Skill skill = NewSkillWithExpectation("Data Engineer", level: 2);
        _skills.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([skill]);
        var assessment = new Assessment(_paula.Id, "2026-S1");
        _assessments.Setup(r => r.GetByIdAsync(assessment.Id, It.IsAny<CancellationToken>())).ReturnsAsync(assessment);
        var useCase = new SaveAssessmentSkillUseCase(
            _assessments.Object, _people.Object, _skills.Object, _version.Object, _unitOfWork.Object);

        SaveAssessmentSkillResponse response = await useCase.ExecuteAsync(new SaveAssessmentSkillCommand(
            _paula.Id, assessment.Id, skill.Id, 2, [[], ["Escribe joins", "Texto inventado"], [], []], ""));

        var savedSkill = response.Assessment.Skills.Single();
        var level2 = savedSkill.Levels.Single(l => l.Level == 2);
        Assert.True(level2.Criteria.Single(c => c.Text == "Escribe joins").Met);
        Assert.DoesNotContain(level2.Criteria, c => c.Text == "Texto inventado");
    }

    [Fact]
    public async Task SaveAssessmentSkill_WithGap_WithoutNote_Throws400_WithTheMockMessage()
    {
        Skill skill = NewSkillWithExpectation("Data Engineer", level: 3);
        _skills.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([skill]);
        var assessment = new Assessment(_paula.Id, "2026-S1");
        _assessments.Setup(r => r.GetByIdAsync(assessment.Id, It.IsAny<CancellationToken>())).ReturnsAsync(assessment);
        var useCase = new SaveAssessmentSkillUseCase(
            _assessments.Object, _people.Object, _skills.Object, _version.Object, _unitOfWork.Object);

        BadRequestException exception = await Assert.ThrowsAsync<BadRequestException>(() => useCase.ExecuteAsync(
            new SaveAssessmentSkillCommand(_paula.Id, assessment.Id, skill.Id, 2, [], "")));

        Assert.Contains("brecha", exception.Message);
    }

    // ── CloseAssessment ───────────────────────────────────────────────────────

    [Fact]
    public async Task CloseAssessment_AllScored_Succeeds_AndFreezes()
    {
        Skill skill = NewSkillWithExpectation("Data Engineer", level: 3);
        _skills.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([skill]);
        var assessment = new Assessment(_paula.Id, "2026-S1");
        assessment.SaveSkill(skill.Id, 2, [], "nota", expectedLevel: 3);
        _assessments.Setup(r => r.GetByIdAsync(assessment.Id, It.IsAny<CancellationToken>())).ReturnsAsync(assessment);
        var useCase = new CloseAssessmentUseCase(
            _assessments.Object, _people.Object, _skills.Object, _version.Object, _unitOfWork.Object, _timeProvider);

        CloseAssessmentResponse response = await useCase.ExecuteAsync(new CloseAssessmentRequest(_paula.Id, assessment.Id));

        Assert.Equal("Closed", response.Assessment.Status);
        Assert.NotNull(response.Assessment.ClosedAtUtc);
    }

    [Fact]
    public async Task CloseAssessment_WithPending_Throws400_ListingTheName()
    {
        Skill skill = NewSkillWithExpectation("Data Engineer", level: 3);
        _skills.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([skill]);
        var assessment = new Assessment(_paula.Id, "2026-S1");
        _assessments.Setup(r => r.GetByIdAsync(assessment.Id, It.IsAny<CancellationToken>())).ReturnsAsync(assessment);
        var useCase = new CloseAssessmentUseCase(
            _assessments.Object, _people.Object, _skills.Object, _version.Object, _unitOfWork.Object, _timeProvider);

        BadRequestException exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new CloseAssessmentRequest(_paula.Id, assessment.Id)));

        Assert.Contains("SQL", exception.Message);
    }

    [Fact]
    public async Task CloseAssessment_AlreadyClosed_Throws400()
    {
        var assessment = new Assessment(_paula.Id, "2026-S1");
        assessment.Close(new Dictionary<Guid, (string, string, IReadOnlyList<IReadOnlyList<string>>, int?)>(), 1, DateTime.UtcNow);
        _assessments.Setup(r => r.GetByIdAsync(assessment.Id, It.IsAny<CancellationToken>())).ReturnsAsync(assessment);
        var useCase = new CloseAssessmentUseCase(
            _assessments.Object, _people.Object, _skills.Object, _version.Object, _unitOfWork.Object, _timeProvider);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            useCase.ExecuteAsync(new CloseAssessmentRequest(_paula.Id, assessment.Id)));
    }

    [Fact]
    public async Task SaveAssessmentSkill_WithMismatchedPersonId_Throws404()
    {
        var assessment = new Assessment(_paula.Id, "2026-S1");
        _assessments.Setup(r => r.GetByIdAsync(assessment.Id, It.IsAny<CancellationToken>())).ReturnsAsync(assessment);
        var useCase = new SaveAssessmentSkillUseCase(
            _assessments.Object, _people.Object, _skills.Object, _version.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<NotFoundException>(() => useCase.ExecuteAsync(
            new SaveAssessmentSkillCommand(Guid.NewGuid(), assessment.Id, Guid.NewGuid(), 2, [], "")));
    }
}
