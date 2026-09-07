using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GestionCapacidad.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Absences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PersonId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    StartsHalfDay = table.Column<bool>(type: "boolean", nullable: false),
                    EndsHalfDay = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RejectReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Absences", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Allocations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PersonId = table.Column<Guid>(type: "uuid", nullable: false),
                    SquadId = table.Column<Guid>(type: "uuid", nullable: false),
                    InitiativeId = table.Column<Guid>(type: "uuid", nullable: true),
                    DedicationPercentage = table.Column<int>(type: "integer", nullable: false),
                    BauPercentage = table.Column<int>(type: "integer", nullable: false),
                    TransformationPercentage = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Allocations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BauTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SquadId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BauTasks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CapabilityMixes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CapabilityMixes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IdentificationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Initiatives",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SquadId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductOwner = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetMonths = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Evaluation = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Initiatives", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "People",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DocumentId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EntraObjectId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UserPrincipalName = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Position = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TechnicalLeadId = table.Column<Guid>(type: "uuid", nullable: true),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    Seniority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Modality = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AvailableFte = table.Column<float>(type: "real", nullable: false),
                    MonthlyCost = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ChapterId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProviderId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_People", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuestionPools",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionPools", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SprintConfigurations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Weeks = table.Column<int>(type: "integer", nullable: false),
                    SprintsPerQuarter = table.Column<int>(type: "integer", nullable: false),
                    HoursPerSprint = table.Column<decimal>(type: "numeric(6,2)", nullable: false),
                    SprintCloseTime = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    HistoryWindowSprints = table.Column<int>(type: "integer", nullable: false),
                    MinHistorySprints = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintConfigurations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Squads",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Criticality = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Tribe = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DevOpsBoardId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Squads", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TallaBandSets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Boundaries = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TallaBandSets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CapabilityMixRows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Key = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Capacidad = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PorTalla = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    CapabilityMixId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CapabilityMixRows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CapabilityMixRows_CapabilityMixes_CapabilityMixId",
                        column: x => x.CapabilityMixId,
                        principalTable: "CapabilityMixes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PersonStacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    PersonId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonStacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonStacks_People_PersonId",
                        column: x => x.PersonId,
                        principalTable: "People",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PoolQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Dimension = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Texto = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Peso = table.Column<int>(type: "integer", nullable: false),
                    QuestionPoolId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PoolQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PoolQuestions_QuestionPools_QuestionPoolId",
                        column: x => x.QuestionPoolId,
                        principalTable: "QuestionPools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TallaBands",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Talla = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    PmMin = table.Column<decimal>(type: "numeric(6,2)", nullable: false),
                    PmMax = table.Column<decimal>(type: "numeric(6,2)", nullable: false),
                    Lectura = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TallaBandSetId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TallaBands", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TallaBands_TallaBandSets_TallaBandSetId",
                        column: x => x.TallaBandSetId,
                        principalTable: "TallaBandSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Absences_PersonId",
                table: "Absences",
                column: "PersonId");

            migrationBuilder.CreateIndex(
                name: "IX_Allocations_PersonId",
                table: "Allocations",
                column: "PersonId");

            migrationBuilder.CreateIndex(
                name: "IX_Allocations_PersonId_SquadId",
                table: "Allocations",
                columns: new[] { "PersonId", "SquadId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Allocations_SquadId",
                table: "Allocations",
                column: "SquadId");

            migrationBuilder.CreateIndex(
                name: "IX_BauTasks_SquadId",
                table: "BauTasks",
                column: "SquadId");

            migrationBuilder.CreateIndex(
                name: "IX_BauTasks_SquadId_Name",
                table: "BauTasks",
                columns: new[] { "SquadId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CapabilityMixRows_CapabilityMixId",
                table: "CapabilityMixRows",
                column: "CapabilityMixId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_Email",
                table: "Companies",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_IdentificationNumber",
                table: "Companies",
                column: "IdentificationNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Initiatives_SquadId",
                table: "Initiatives",
                column: "SquadId");

            migrationBuilder.CreateIndex(
                name: "IX_Initiatives_SquadId_Status",
                table: "Initiatives",
                columns: new[] { "SquadId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_People_ChapterId",
                table: "People",
                column: "ChapterId");

            migrationBuilder.CreateIndex(
                name: "IX_People_DocumentId",
                table: "People",
                column: "DocumentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_People_UserPrincipalName",
                table: "People",
                column: "UserPrincipalName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PersonStacks_PersonId",
                table: "PersonStacks",
                column: "PersonId");

            migrationBuilder.CreateIndex(
                name: "IX_PoolQuestions_QuestionPoolId",
                table: "PoolQuestions",
                column: "QuestionPoolId");

            migrationBuilder.CreateIndex(
                name: "IX_Squads_Name",
                table: "Squads",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TallaBands_TallaBandSetId",
                table: "TallaBands",
                column: "TallaBandSetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Absences");

            migrationBuilder.DropTable(
                name: "Allocations");

            migrationBuilder.DropTable(
                name: "BauTasks");

            migrationBuilder.DropTable(
                name: "CapabilityMixRows");

            migrationBuilder.DropTable(
                name: "Companies");

            migrationBuilder.DropTable(
                name: "Initiatives");

            migrationBuilder.DropTable(
                name: "PersonStacks");

            migrationBuilder.DropTable(
                name: "PoolQuestions");

            migrationBuilder.DropTable(
                name: "SprintConfigurations");

            migrationBuilder.DropTable(
                name: "Squads");

            migrationBuilder.DropTable(
                name: "TallaBands");

            migrationBuilder.DropTable(
                name: "CapabilityMixes");

            migrationBuilder.DropTable(
                name: "People");

            migrationBuilder.DropTable(
                name: "QuestionPools");

            migrationBuilder.DropTable(
                name: "TallaBandSets");
        }
    }
}
