using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _3DPrintingHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EntidadesDeModelosYProductos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Color",
                table: "ProductStocks");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "ModelPrints");

            migrationBuilder.DropColumn(
                name: "RequiresIroning",
                table: "ModelPrints");

            migrationBuilder.RenameColumn(
                name: "RequiresSupports",
                table: "ModelPrints",
                newName: "CommercialLicense");

            migrationBuilder.AddColumn<Guid>(
                name: "FilamentId",
                table: "ProductStocks",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "ModelPrints",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<decimal>(
                name: "DefaultCost",
                table: "ModelPrints",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "FilamentId",
                table: "ModelPrints",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Marketplace",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ModelPrintCategory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelPrintCategory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PublishedModels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Published = table.Column<int>(type: "integer", nullable: false),
                    MarketplaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductStockId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublishedModels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PublishedModels_Marketplace_MarketplaceId",
                        column: x => x.MarketplaceId,
                        principalTable: "Marketplace",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PublishedModels_ProductStocks_ProductStockId",
                        column: x => x.ProductStockId,
                        principalTable: "ProductStocks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductStocks_FilamentId",
                table: "ProductStocks",
                column: "FilamentId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelPrints_CategoryId",
                table: "ModelPrints",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelPrints_FilamentId",
                table: "ModelPrints",
                column: "FilamentId");

            migrationBuilder.CreateIndex(
                name: "IX_PublishedModels_MarketplaceId",
                table: "PublishedModels",
                column: "MarketplaceId");

            migrationBuilder.CreateIndex(
                name: "IX_PublishedModels_ProductStockId",
                table: "PublishedModels",
                column: "ProductStockId");

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
                name: "FK_ProductStocks_Filaments_FilamentId",
                table: "ProductStocks",
                column: "FilamentId",
                principalTable: "Filaments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ModelPrints_Filaments_FilamentId",
                table: "ModelPrints");

            migrationBuilder.DropForeignKey(
                name: "FK_ModelPrints_ModelPrintCategory_CategoryId",
                table: "ModelPrints");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductStocks_Filaments_FilamentId",
                table: "ProductStocks");

            migrationBuilder.DropTable(
                name: "ModelPrintCategory");

            migrationBuilder.DropTable(
                name: "PublishedModels");

            migrationBuilder.DropTable(
                name: "Marketplace");

            migrationBuilder.DropIndex(
                name: "IX_ProductStocks_FilamentId",
                table: "ProductStocks");

            migrationBuilder.DropIndex(
                name: "IX_ModelPrints_CategoryId",
                table: "ModelPrints");

            migrationBuilder.DropIndex(
                name: "IX_ModelPrints_FilamentId",
                table: "ModelPrints");

            migrationBuilder.DropColumn(
                name: "FilamentId",
                table: "ProductStocks");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "ModelPrints");

            migrationBuilder.DropColumn(
                name: "DefaultCost",
                table: "ModelPrints");

            migrationBuilder.DropColumn(
                name: "FilamentId",
                table: "ModelPrints");

            migrationBuilder.RenameColumn(
                name: "CommercialLicense",
                table: "ModelPrints",
                newName: "RequiresSupports");

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "ProductStocks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "ModelPrints",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresIroning",
                table: "ModelPrints",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
