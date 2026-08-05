using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _3DPrintingHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EntidadesDeModelosYProductos2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FilamentProfiles_Brands_BrandId",
                table: "FilamentProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_FilamentProfiles_MaterialType_MaterialTypeId",
                table: "FilamentProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_ModelPrints_Filaments_FilamentId",
                table: "ModelPrints");

            migrationBuilder.DropForeignKey(
                name: "FK_ModelPrints_ModelPrintCategory_CategoryId",
                table: "ModelPrints");

            migrationBuilder.DropForeignKey(
                name: "FK_PrintJobs_Filaments_FilamentId",
                table: "PrintJobs");

            migrationBuilder.DropForeignKey(
                name: "FK_PrintJobs_ModelPrints_ModelPrintId",
                table: "PrintJobs");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductStocks_Filaments_FilamentId",
                table: "ProductStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductStocks_ModelPrints_ModelPrintId",
                table: "ProductStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_PublishedModels_Marketplace_MarketplaceId",
                table: "PublishedModels");

            migrationBuilder.DropForeignKey(
                name: "FK_PublishedModels_ProductStocks_ProductStockId",
                table: "PublishedModels");

            migrationBuilder.DropIndex(
                name: "IX_ModelPrints_FilamentId",
                table: "ModelPrints");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ModelPrintCategory",
                table: "ModelPrintCategory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MaterialType",
                table: "MaterialType");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Marketplace",
                table: "Marketplace");

            migrationBuilder.DropColumn(
                name: "FilamentId",
                table: "ModelPrints");

            migrationBuilder.RenameTable(
                name: "ModelPrintCategory",
                newName: "ModelPrintCategories");

            migrationBuilder.RenameTable(
                name: "MaterialType",
                newName: "MaterialTypes");

            migrationBuilder.RenameTable(
                name: "Marketplace",
                newName: "Marketplaces");

            migrationBuilder.AlterColumn<decimal>(
                name: "SalePrice",
                table: "ProductStocks",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "CostToProduce",
                table: "ProductStocks",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<decimal>(
                name: "CalculatedMaterialCost",
                table: "PrintJobs",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ModelPrintCategories",
                table: "ModelPrintCategories",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MaterialTypes",
                table: "MaterialTypes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Marketplaces",
                table: "Marketplaces",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    parameter = table.Column<string>(type: "text", nullable: false),
                    value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_FilamentProfiles_Brands_BrandId",
                table: "FilamentProfiles",
                column: "BrandId",
                principalTable: "Brands",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FilamentProfiles_MaterialTypes_MaterialTypeId",
                table: "FilamentProfiles",
                column: "MaterialTypeId",
                principalTable: "MaterialTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ModelPrints_ModelPrintCategories_CategoryId",
                table: "ModelPrints",
                column: "CategoryId",
                principalTable: "ModelPrintCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PrintJobs_Filaments_FilamentId",
                table: "PrintJobs",
                column: "FilamentId",
                principalTable: "Filaments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PrintJobs_ModelPrints_ModelPrintId",
                table: "PrintJobs",
                column: "ModelPrintId",
                principalTable: "ModelPrints",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStocks_Filaments_FilamentId",
                table: "ProductStocks",
                column: "FilamentId",
                principalTable: "Filaments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStocks_ModelPrints_ModelPrintId",
                table: "ProductStocks",
                column: "ModelPrintId",
                principalTable: "ModelPrints",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PublishedModels_Marketplaces_MarketplaceId",
                table: "PublishedModels",
                column: "MarketplaceId",
                principalTable: "Marketplaces",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PublishedModels_ProductStocks_ProductStockId",
                table: "PublishedModels",
                column: "ProductStockId",
                principalTable: "ProductStocks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FilamentProfiles_Brands_BrandId",
                table: "FilamentProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_FilamentProfiles_MaterialTypes_MaterialTypeId",
                table: "FilamentProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_ModelPrints_ModelPrintCategories_CategoryId",
                table: "ModelPrints");

            migrationBuilder.DropForeignKey(
                name: "FK_PrintJobs_Filaments_FilamentId",
                table: "PrintJobs");

            migrationBuilder.DropForeignKey(
                name: "FK_PrintJobs_ModelPrints_ModelPrintId",
                table: "PrintJobs");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductStocks_Filaments_FilamentId",
                table: "ProductStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductStocks_ModelPrints_ModelPrintId",
                table: "ProductStocks");

            migrationBuilder.DropForeignKey(
                name: "FK_PublishedModels_Marketplaces_MarketplaceId",
                table: "PublishedModels");

            migrationBuilder.DropForeignKey(
                name: "FK_PublishedModels_ProductStocks_ProductStockId",
                table: "PublishedModels");

            migrationBuilder.DropTable(
                name: "Settings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ModelPrintCategories",
                table: "ModelPrintCategories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MaterialTypes",
                table: "MaterialTypes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Marketplaces",
                table: "Marketplaces");

            migrationBuilder.RenameTable(
                name: "ModelPrintCategories",
                newName: "ModelPrintCategory");

            migrationBuilder.RenameTable(
                name: "MaterialTypes",
                newName: "MaterialType");

            migrationBuilder.RenameTable(
                name: "Marketplaces",
                newName: "Marketplace");

            migrationBuilder.AlterColumn<decimal>(
                name: "SalePrice",
                table: "ProductStocks",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AlterColumn<decimal>(
                name: "CostToProduce",
                table: "ProductStocks",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AlterColumn<decimal>(
                name: "CalculatedMaterialCost",
                table: "PrintJobs",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AddColumn<Guid>(
                name: "FilamentId",
                table: "ModelPrints",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ModelPrintCategory",
                table: "ModelPrintCategory",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MaterialType",
                table: "MaterialType",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Marketplace",
                table: "Marketplace",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_ModelPrints_FilamentId",
                table: "ModelPrints",
                column: "FilamentId");

            migrationBuilder.AddForeignKey(
                name: "FK_FilamentProfiles_Brands_BrandId",
                table: "FilamentProfiles",
                column: "BrandId",
                principalTable: "Brands",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FilamentProfiles_MaterialType_MaterialTypeId",
                table: "FilamentProfiles",
                column: "MaterialTypeId",
                principalTable: "MaterialType",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ModelPrints_Filaments_FilamentId",
                table: "ModelPrints",
                column: "FilamentId",
                principalTable: "Filaments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ModelPrints_ModelPrintCategory_CategoryId",
                table: "ModelPrints",
                column: "CategoryId",
                principalTable: "ModelPrintCategory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PrintJobs_Filaments_FilamentId",
                table: "PrintJobs",
                column: "FilamentId",
                principalTable: "Filaments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PrintJobs_ModelPrints_ModelPrintId",
                table: "PrintJobs",
                column: "ModelPrintId",
                principalTable: "ModelPrints",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStocks_Filaments_FilamentId",
                table: "ProductStocks",
                column: "FilamentId",
                principalTable: "Filaments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStocks_ModelPrints_ModelPrintId",
                table: "ProductStocks",
                column: "ModelPrintId",
                principalTable: "ModelPrints",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PublishedModels_Marketplace_MarketplaceId",
                table: "PublishedModels",
                column: "MarketplaceId",
                principalTable: "Marketplace",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PublishedModels_ProductStocks_ProductStockId",
                table: "PublishedModels",
                column: "ProductStockId",
                principalTable: "ProductStocks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
