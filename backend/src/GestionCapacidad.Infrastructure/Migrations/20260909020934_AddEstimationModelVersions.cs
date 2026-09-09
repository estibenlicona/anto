using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GestionCapacidad.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEstimationModelVersions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EstimationModels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Phase = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstimationModels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ModelVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EffectiveFrom = table.Column<DateOnly>(type: "date", nullable: true),
                    EffectiveTo = table.Column<DateOnly>(type: "date", nullable: true),
                    ChangeNote = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TallaBoundaries = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    EstimationModelId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelVersions_EstimationModels_EstimationModelId",
                        column: x => x.EstimationModelId,
                        principalTable: "EstimationModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelChangeEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OccurredAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Author = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Section = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Summary = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ModelVersionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelChangeEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelChangeEntries_ModelVersions_ModelVersionId",
                        column: x => x.ModelVersionId,
                        principalTable: "ModelVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelDimensions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    ModelVersionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelDimensions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelDimensions_ModelVersions_ModelVersionId",
                        column: x => x.ModelVersionId,
                        principalTable: "ModelVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelDrivers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Outputs = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ModelVersionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelDrivers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelDrivers_ModelVersions_ModelVersionId",
                        column: x => x.ModelVersionId,
                        principalTable: "ModelVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelMixModifiers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DriverCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ConditionOperator = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Threshold = table.Column<decimal>(type: "numeric(5,4)", nullable: false),
                    Tallas = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ModelVersionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelMixModifiers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelMixModifiers_ModelVersions_ModelVersionId",
                        column: x => x.ModelVersionId,
                        principalTable: "ModelVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelMixRows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Key = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Capacidad = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PorTalla = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    ModelVersionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelMixRows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelMixRows_ModelVersions_ModelVersionId",
                        column: x => x.ModelVersionId,
                        principalTable: "ModelVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DimensionCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Texto = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Unit = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    DriverCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Weights = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    ModelVersionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelQuestions_ModelVersions_ModelVersionId",
                        column: x => x.ModelVersionId,
                        principalTable: "ModelVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelRiskBands",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Level = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    MaxPct = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    ModelVersionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelRiskBands", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelRiskBands_ModelVersions_ModelVersionId",
                        column: x => x.ModelVersionId,
                        principalTable: "ModelVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelTallaRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Talla = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    PmMin = table.Column<decimal>(type: "numeric(6,2)", nullable: false),
                    PmExpected = table.Column<decimal>(type: "numeric(6,2)", nullable: false),
                    PmMax = table.Column<decimal>(type: "numeric(6,2)", nullable: false),
                    Lectura = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ModelVersionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelTallaRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelTallaRules_ModelVersions_ModelVersionId",
                        column: x => x.ModelVersionId,
                        principalTable: "ModelVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelTriageQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Texto = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Critical = table.Column<bool>(type: "boolean", nullable: false),
                    ModelVersionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelTriageQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelTriageQuestions_ModelVersions_ModelVersionId",
                        column: x => x.ModelVersionId,
                        principalTable: "ModelVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelMixAdjustments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    CapabilityKey = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Points = table.Column<decimal>(type: "numeric(6,2)", nullable: false),
                    MixModifierId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelMixAdjustments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelMixAdjustments_ModelMixModifiers_MixModifierId",
                        column: x => x.MixModifierId,
                        principalTable: "ModelMixModifiers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelQuestionOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Score = table.Column<decimal>(type: "numeric(5,4)", nullable: false),
                    From = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    To = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    ModelQuestionId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelQuestionOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelQuestionOptions_ModelQuestions_ModelQuestionId",
                        column: x => x.ModelQuestionId,
                        principalTable: "ModelQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ModelChangeEntries_ModelVersionId",
                table: "ModelChangeEntries",
                column: "ModelVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelDimensions_ModelVersionId",
                table: "ModelDimensions",
                column: "ModelVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelDrivers_ModelVersionId",
                table: "ModelDrivers",
                column: "ModelVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelMixAdjustments_MixModifierId",
                table: "ModelMixAdjustments",
                column: "MixModifierId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelMixModifiers_ModelVersionId",
                table: "ModelMixModifiers",
                column: "ModelVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelMixRows_ModelVersionId",
                table: "ModelMixRows",
                column: "ModelVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelQuestionOptions_ModelQuestionId",
                table: "ModelQuestionOptions",
                column: "ModelQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelQuestions_ModelVersionId",
                table: "ModelQuestions",
                column: "ModelVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelRiskBands_ModelVersionId",
                table: "ModelRiskBands",
                column: "ModelVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelTallaRules_ModelVersionId",
                table: "ModelTallaRules",
                column: "ModelVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelTriageQuestions_ModelVersionId",
                table: "ModelTriageQuestions",
                column: "ModelVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelVersions_EstimationModelId",
                table: "ModelVersions",
                column: "EstimationModelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ModelChangeEntries");

            migrationBuilder.DropTable(
                name: "ModelDimensions");

            migrationBuilder.DropTable(
                name: "ModelDrivers");

            migrationBuilder.DropTable(
                name: "ModelMixAdjustments");

            migrationBuilder.DropTable(
                name: "ModelMixRows");

            migrationBuilder.DropTable(
                name: "ModelQuestionOptions");

            migrationBuilder.DropTable(
                name: "ModelRiskBands");

            migrationBuilder.DropTable(
                name: "ModelTallaRules");

            migrationBuilder.DropTable(
                name: "ModelTriageQuestions");

            migrationBuilder.DropTable(
                name: "ModelMixModifiers");

            migrationBuilder.DropTable(
                name: "ModelQuestions");

            migrationBuilder.DropTable(
                name: "ModelVersions");

            migrationBuilder.DropTable(
                name: "EstimationModels");
        }
    }
}
