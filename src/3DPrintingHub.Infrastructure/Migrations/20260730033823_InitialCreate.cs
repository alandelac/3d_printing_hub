using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _3DPrintingHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FilamentProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Brand = table.Column<string>(type: "text", nullable: false),
                    MaterialType = table.Column<int>(type: "integer", nullable: false),
                    MaterialSubType = table.Column<int>(type: "integer", nullable: false),
                    IroningSupported = table.Column<bool>(type: "boolean", nullable: false),
                    IroningFlowPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    IroningSpeedMmS = table.Column<decimal>(type: "numeric", nullable: true),
                    slopeAngleForSupports = table.Column<int>(type: "integer", nullable: false),
                    zSeparationForSupports = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FilamentProfiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ModelPrints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: true),
                    EstimatedWeightGrams = table.Column<int>(type: "integer", nullable: false),
                    EstimatedTimeMinutes = table.Column<int>(type: "integer", nullable: false),
                    RequiresIroning = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresSupports = table.Column<bool>(type: "boolean", nullable: false),
                    DefaultSalePrice = table.Column<decimal>(type: "numeric", nullable: false),
                    FileLocationOrUrl = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelPrints", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Filaments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FilamentProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    TotalWeightGrams = table.Column<int>(type: "integer", nullable: false),
                    RemainingWeightGrams = table.Column<int>(type: "integer", nullable: false),
                    SpoolEmptyWeightGrams = table.Column<int>(type: "integer", nullable: false),
                    minCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    maxCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    lastCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CustomNozzleTemp = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Filaments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Filaments_FilamentProfiles_FilamentProfileId",
                        column: x => x.FilamentProfileId,
                        principalTable: "FilamentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductStocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ModelPrintId = table.Column<Guid>(type: "uuid", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    QuantityInStock = table.Column<int>(type: "integer", nullable: false),
                    CostToProduce = table.Column<decimal>(type: "numeric", nullable: false),
                    SalePrice = table.Column<decimal>(type: "numeric", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductStocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductStocks_ModelPrints_ModelPrintId",
                        column: x => x.ModelPrintId,
                        principalTable: "ModelPrints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PrintJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FilamentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModelPrintId = table.Column<Guid>(type: "uuid", nullable: false),
                    UsedWeightGrams = table.Column<decimal>(type: "numeric", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    PrintedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CalculatedMaterialCost = table.Column<decimal>(type: "numeric", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintJobs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrintJobs_Filaments_FilamentId",
                        column: x => x.FilamentId,
                        principalTable: "Filaments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PrintJobs_ModelPrints_ModelPrintId",
                        column: x => x.ModelPrintId,
                        principalTable: "ModelPrints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Filaments_FilamentProfileId",
                table: "Filaments",
                column: "FilamentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_FilamentId",
                table: "PrintJobs",
                column: "FilamentId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_ModelPrintId",
                table: "PrintJobs",
                column: "ModelPrintId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStocks_ModelPrintId",
                table: "ProductStocks",
                column: "ModelPrintId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrintJobs");

            migrationBuilder.DropTable(
                name: "ProductStocks");

            migrationBuilder.DropTable(
                name: "Filaments");

            migrationBuilder.DropTable(
                name: "ModelPrints");

            migrationBuilder.DropTable(
                name: "FilamentProfiles");
        }
    }
}
