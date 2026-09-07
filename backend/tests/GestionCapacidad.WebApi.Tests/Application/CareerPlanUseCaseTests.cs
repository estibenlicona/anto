using GestionCapacidad.Application.UseCases.CareerPlan.CreatePlanAction;
using GestionCapacidad.Application.UseCases.CareerPlan.GetPersonPlan;
using GestionCapacidad.Application.UseCases.CareerPlan.GetSpanMatrix;
using GestionCapacidad.Application.UseCases.CareerPlan.GetSpanSummary;
using GestionCapacidad.Application.UseCases.CareerPlan.SetPlanActionStatus;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Microsoft.Extensions.Time.Testing;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class CareerPlanUseCaseTests
{
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<ISkillRepository> _skills = new();
    private readonly Mock<IAssessmentRepository> _assessments = new();
    private readonly Mock<IPlanActionRepository> _actions = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly FakeTimeProvider _timeProvider = new(new DateTimeOffset(2026, 9, 6, 0, 0, 0, TimeSpan.Zero));

    private readonly Person _sinEvaluar = TestDataFactory.CreatePerson(name: "Sin Evaluar", position: "Backend Dev");
    private readonly Person _maria = TestDataFactory.CreatePerson(name: "María", position: "Backend Dev");
    private readonly Skill _sql = NewSkill("SQL", "Backend Dev", expectedLevel: 3);
    private readonly Skill _azure = NewSkill("Azure", "Backend Dev", expectedLevel: 2);
    private readonly Skill _comunicacion = NewSkill("Comunicación", "Backend Dev", expectedLevel: 2);
    private readonly Assessment _mariaAssessment;

    private static Skill NewSkill(string name, string position, int expectedLevel)
    {
        var skill = new Skill(name, SkillGroup.Technical, "Descripción.");
        skill.ReplaceCriteria(1, ["Criterio 1"]);
        skill.ReplaceCriteria(2, ["Criterio 2"]);
        skill.ReplaceCriteria(3, ["Criterio 3"]);
        skill.SetExpectation(position, expectedLevel);
        return skill;
    }

    public CareerPlanUseCaseTests()
    {
        // María: SQL en 1 (brecha de 2 contra 3), Azure en 1 (brecha de 1 contra 2), Comunicación en 2 (al nivel, sin brecha).
        _mariaAssessment = new Assessment(_maria.Id, "2026-S1");
        _mariaAssessment.SaveSkill(_sql.Id, 1, [[], [], [], []], "Le falta mucho.", expectedLevel: 3);
        _mariaAssessment.SaveSkill(_azure.Id, 1, [[], [], [], []], "Le falta un poco.", expectedLevel: 2);
        _mariaAssessment.SaveSkill(_comunicacion.Id, 2, [[], [], [], []], "", expectedLevel: 2);
        _mariaAssessment.Close(
            new Dictionary<Guid, (string, string, IReadOnlyList<IReadOnlyList<string>>, int?)>
            {
                [_sql.Id] = ("SQL", "technical", [.. _sql.Levels.OrderBy(l => l.Level.Value).Select(l => l.Criteria)], 3),
                [_azure.Id] = ("Azure", "technical", [.. _azure.Levels.OrderBy(l => l.Level.Value).Select(l => l.Criteria)], 2),
                [_comunicacion.Id] = ("Comunicación", "human", [.. _comunicacion.Levels.OrderBy(l => l.Level.Value).Select(l => l.Criteria)], 2),
            },
            1, DateTime.UtcNow);

        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_sinEvaluar, _maria]);
        _people.Setup(r => r.GetByIdAsync(_sinEvaluar.Id, It.IsAny<CancellationToken>())).ReturnsAsync(_sinEvaluar);
        _people.Setup(r => r.GetByIdAsync(_maria.Id, It.IsAny<CancellationToken>())).ReturnsAsync(_maria);
        _skills.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_sql, _azure, _comunicacion]);
        _assessments.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_mariaAssessment]);
        _actions.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<PlanAction>());
        _actions.Setup(r => r.GetByPersonAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<PlanAction>());
    }

    private CreatePlanActionUseCase NewCreateActionUseCase() =>
        new(_people.Object, _skills.Object, _assessments.Object, _actions.Object, _unitOfWork.Object);

    /// <summary>Aísla el escenario "nadie evaluado" del resto: sólo <c>_sinEvaluar</c>, sin habilidades ni evaluaciones.</summary>
    private void SetupNoOneEvaluated()
    {
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([_sinEvaluar]);
        _skills.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Skill>());
        _assessments.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Assessment>());
    }

    [Fact]
    public async Task GetSpanMatrix_WithNoOneEvaluated_EveryRowIsNotEvaluated()
    {
        SetupNoOneEvaluated();
        var useCase = new GetSpanMatrixUseCase(_people.Object, _skills.Object, _assessments.Object);

        GetSpanMatrixResponse response = await useCase.ExecuteAsync();

        Assert.All(response.Span.People, p => Assert.False(p.Evaluated));
    }

    [Fact]
    public async Task GetSpanSummary_WithNoOneEvaluated_TheFourIndicatorsAreZeroExceptTotalPeople()
    {
        SetupNoOneEvaluated();
        var useCase = new GetSpanSummaryUseCase(
            _people.Object, _skills.Object, _assessments.Object, _actions.Object, _timeProvider);

        GetSpanSummaryResponse response = await useCase.ExecuteAsync();

        Assert.Equal(0, response.Summary.TotalGaps);
        Assert.Equal(0, response.Summary.CriticalGaps);
        Assert.Equal(0, response.Summary.EvaluatedPeople);
        Assert.Equal(1, response.Summary.TotalPeople);
        Assert.Empty(response.Summary.PeopleAtRisk);
    }

    [Fact]
    public async Task GetPersonPlan_WithUnknownPerson_Throws404()
    {
        var useCase = new GetPersonPlanUseCase(_people.Object, _skills.Object, _assessments.Object, _actions.Object);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            useCase.ExecuteAsync(new GetPersonPlanRequest(Guid.NewGuid())));
    }

    [Fact]
    public async Task GetPersonPlan_PersonWithoutClosedAssessment_HasEmptySkillsAndNullCycle()
    {
        var useCase = new GetPersonPlanUseCase(_people.Object, _skills.Object, _assessments.Object, _actions.Object);

        GetPersonPlanResponse response = await useCase.ExecuteAsync(new GetPersonPlanRequest(_sinEvaluar.Id));

        Assert.Empty(response.Plan.Skills);
        Assert.Null(response.Plan.Cycle);
        Assert.Empty(response.Plan.Actions);
    }

    [Fact]
    public async Task CreatePlanAction_WithUnknownPerson_Throws404()
    {
        await Assert.ThrowsAsync<NotFoundException>(() =>
            NewCreateActionUseCase().ExecuteAsync(new CreatePlanActionCommand(Guid.NewGuid(), _sql.Id, 3, "2026-12", "Curso")));
    }

    [Fact]
    public async Task CreatePlanAction_WithASkillTheAssessmentNeverScored_Throws400()
    {
        await Assert.ThrowsAsync<BadRequestException>(() =>
            NewCreateActionUseCase().ExecuteAsync(new CreatePlanActionCommand(_maria.Id, Guid.NewGuid(), 3, "2026-12", "Curso")));
    }

    [Fact]
    public async Task CreatePlanAction_OnASkillWithoutGap_Throws400()
    {
        // Comunicación la tiene calificada al nivel exigido (2 = 2): sin brecha registrada.
        BadRequestException exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            NewCreateActionUseCase().ExecuteAsync(new CreatePlanActionCommand(_maria.Id, _comunicacion.Id, 4, "2026-12", "Curso")));

        Assert.Contains("Comunicación", exception.Message);
    }

    [Theory]
    [InlineData(1, "2026-12", "Curso")] // objetivo no mayor al alcanzado (1, achieved level)
    [InlineData(3, "26-12", "Curso")]   // mes con forma inválida
    [InlineData(3, "2026-12", "  ")]     // título vacío
    public async Task CreatePlanAction_WithAnInvalidField_Throws400(int targetLevel, string dueMonth, string title)
    {
        await Assert.ThrowsAsync<BadRequestException>(() =>
            NewCreateActionUseCase().ExecuteAsync(new CreatePlanActionCommand(_maria.Id, _sql.Id, targetLevel, dueMonth, title)));
    }

    [Fact]
    public async Task CreatePlanAction_ActionsOnDifferentSkillsOfTheSamePersonCoexist()
    {
        List<PlanAction> persisted = [];
        _actions.Setup(r => r.AddAsync(It.IsAny<PlanAction>(), It.IsAny<CancellationToken>()))
            .Callback<PlanAction, CancellationToken>((a, _) => persisted.Add(a))
            .Returns(Task.CompletedTask);
        _actions.Setup(r => r.GetByPersonAsync(_maria.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => (IReadOnlyList<PlanAction>)[.. persisted]);

        await NewCreateActionUseCase().ExecuteAsync(new CreatePlanActionCommand(_maria.Id, _sql.Id, 3, "2026-12", "Curso de SQL"));
        CreatePlanActionResponse second = await NewCreateActionUseCase().ExecuteAsync(
            new CreatePlanActionCommand(_maria.Id, _azure.Id, 2, "2026-12", "Curso de Azure"));

        Assert.Equal(2, second.Plan.Actions.Count);
        Assert.Contains(second.Plan.Actions, a => a.SkillName == "SQL");
        Assert.Contains(second.Plan.Actions, a => a.SkillName == "Azure");
    }

    [Fact]
    public async Task SetPlanActionStatus_WithUnknownAction_Throws404()
    {
        _actions.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((PlanAction?)null);
        var useCase = new SetPlanActionStatusUseCase(_people.Object, _skills.Object, _assessments.Object, _actions.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            useCase.ExecuteAsync(new SetPlanActionStatusCommand(_maria.Id, Guid.NewGuid(), "Done")));
    }

    [Fact]
    public async Task SetPlanActionStatus_MarkingDone_DoesNotChangeTheGapReportedByGetPersonPlan()
    {
        var action = new PlanAction(_maria.Id, _sql.Id, 1, 3, "2026-12", "Curso de SQL");
        _actions.Setup(r => r.GetByIdAsync(action.Id, It.IsAny<CancellationToken>())).ReturnsAsync(action);
        _actions.Setup(r => r.GetByPersonAsync(_maria.Id, It.IsAny<CancellationToken>())).ReturnsAsync([action]);
        var useCase = new SetPlanActionStatusUseCase(_people.Object, _skills.Object, _assessments.Object, _actions.Object, _unitOfWork.Object);

        SetPlanActionStatusResponse response = await useCase.ExecuteAsync(
            new SetPlanActionStatusCommand(_maria.Id, action.Id, "Done"));

        Assert.Equal("Done", Assert.Single(response.Plan.Actions).Status);
        PlanSkillDto sqlSkill = response.Plan.Skills.Single(s => s.SkillId == _sql.Id);
        Assert.Equal(2m, sqlSkill.Gap);
    }
}
