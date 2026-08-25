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
                name: "Brands",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FilamentColors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    ColorCode = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FilamentColors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Marketplaces",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplaces", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MaterialTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaterialTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ModelPrintCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelPrintCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    parameter = table.Column<string>(type: "TEXT", nullable: false),
                    value = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FilamentProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    BrandId = table.Column<Guid>(type: "TEXT", nullable: false),
                    MaterialTypeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    IroningFlowPercentage = table.Column<decimal>(type: "TEXT", precision: 5, scale: 2, nullable: true),
                    IroningSpeedMmS = table.Column<decimal>(type: "TEXT", nullable: true),
                    SlopeAngleForSupports = table.Column<int>(type: "INTEGER", nullable: true),
                    ZSeparationForSupports = table.Column<decimal>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FilamentProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FilamentProfiles_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FilamentProfiles_MaterialTypes_MaterialTypeId",
                        column: x => x.MaterialTypeId,
                        principalTable: "MaterialTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ModelPrints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    CategoryId = table.Column<Guid>(type: "TEXT", nullable: false),
                    EstimatedWeightGrams = table.Column<int>(type: "INTEGER", nullable: false),
                    EstimatedTimeMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    CommercialLicense = table.Column<bool>(type: "INTEGER", nullable: false),
                    DefaultSalePrice = table.Column<decimal>(type: "TEXT", nullable: false),
                    DefaultCost = table.Column<decimal>(type: "TEXT", nullable: false),
                    FileLocationOrUrl = table.Column<string>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelPrints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelPrints_ModelPrintCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "ModelPrintCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Filaments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    FilamentProfileId = table.Column<Guid>(type: "TEXT", nullable: false),
                    FilamentColorId = table.Column<Guid>(type: "TEXT", nullable: false),
                    RemainingWeightGrams = table.Column<int>(type: "INTEGER", nullable: false),
                    MinCost = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    MaxCost = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    LastCost = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    LastPurchaseDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    BuyLink = table.Column<string>(type: "TEXT", nullable: true),
                    BuyAgain = table.Column<bool>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Filaments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Filaments_FilamentColors_FilamentColorId",
                        column: x => x.FilamentColorId,
                        principalTable: "FilamentColors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Filaments_FilamentProfiles_FilamentProfileId",
                        column: x => x.FilamentProfileId,
                        principalTable: "FilamentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrintJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    FilamentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ModelPrintId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UsedWeightGrams = table.Column<decimal>(type: "TEXT", nullable: false),
                    PrintedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CalculatedMaterialCost = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintJobs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrintJobs_Filaments_FilamentId",
                        column: x => x.FilamentId,
                        principalTable: "Filaments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrintJobs_ModelPrints_ModelPrintId",
                        column: x => x.ModelPrintId,
                        principalTable: "ModelPrints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductStocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ModelPrintId = table.Column<Guid>(type: "TEXT", nullable: false),
                    FilamentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuantityInStock = table.Column<int>(type: "INTEGER", nullable: false),
                    CostToProduce = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    RecommendedSalePrice = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    SalePrice = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductStocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductStocks_Filaments_FilamentId",
                        column: x => x.FilamentId,
                        principalTable: "Filaments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductStocks_ModelPrints_ModelPrintId",
                        column: x => x.ModelPrintId,
                        principalTable: "ModelPrints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PublishedModels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Published = table.Column<int>(type: "INTEGER", nullable: false),
                    MarketplaceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProductStockId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublishedModels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PublishedModels_Marketplaces_MarketplaceId",
                        column: x => x.MarketplaceId,
                        principalTable: "Marketplaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PublishedModels_ProductStocks_ProductStockId",
                        column: x => x.ProductStockId,
                        principalTable: "ProductStocks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FilamentProfiles_BrandId_MaterialTypeId",
                table: "FilamentProfiles",
                columns: new[] { "BrandId", "MaterialTypeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FilamentProfiles_MaterialTypeId",
                table: "FilamentProfiles",
                column: "MaterialTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Filaments_FilamentColorId",
                table: "Filaments",
                column: "FilamentColorId");

            migrationBuilder.CreateIndex(
                name: "IX_Filaments_FilamentProfileId",
                table: "Filaments",
                column: "FilamentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelPrints_CategoryId",
                table: "ModelPrints",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_FilamentId",
                table: "PrintJobs",
                column: "FilamentId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintJobs_ModelPrintId",
                table: "PrintJobs",
                column: "ModelPrintId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStocks_FilamentId",
                table: "ProductStocks",
                column: "FilamentId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStocks_ModelPrintId",
                table: "ProductStocks",
                column: "ModelPrintId");

            migrationBuilder.CreateIndex(
                name: "IX_PublishedModels_MarketplaceId",
                table: "PublishedModels",
                column: "MarketplaceId");

            migrationBuilder.CreateIndex(
                name: "IX_PublishedModels_ProductStockId",
                table: "PublishedModels",
                column: "ProductStockId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrintJobs");

            migrationBuilder.DropTable(
                name: "PublishedModels");

            migrationBuilder.DropTable(
                name: "Settings");

            migrationBuilder.DropTable(
                name: "Marketplaces");

            migrationBuilder.DropTable(
                name: "ProductStocks");

            migrationBuilder.DropTable(
                name: "Filaments");

            migrationBuilder.DropTable(
                name: "ModelPrints");

            migrationBuilder.DropTable(
                name: "FilamentColors");

            migrationBuilder.DropTable(
                name: "FilamentProfiles");

            migrationBuilder.DropTable(
                name: "ModelPrintCategories");

            migrationBuilder.DropTable(
                name: "Brands");

            migrationBuilder.DropTable(
                name: "MaterialTypes");
        }
    }
}
