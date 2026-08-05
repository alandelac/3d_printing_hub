using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _3DPrintingHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EstructuraDeFilamentos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "PrintJobs");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "Filaments");

            migrationBuilder.DropColumn(
                name: "CustomNozzleTemp",
                table: "Filaments");

            migrationBuilder.DropColumn(
                name: "SpoolEmptyWeightGrams",
                table: "Filaments");

            migrationBuilder.DropColumn(
                name: "TotalWeightGrams",
                table: "Filaments");

            migrationBuilder.DropColumn(
                name: "Brand",
                table: "FilamentProfiles");

            migrationBuilder.DropColumn(
                name: "IroningSupported",
                table: "FilamentProfiles");

            migrationBuilder.DropColumn(
                name: "MaterialSubType",
                table: "FilamentProfiles");

            migrationBuilder.DropColumn(
                name: "MaterialType",
                table: "FilamentProfiles");

            migrationBuilder.RenameColumn(
                name: "minCost",
                table: "Filaments",
                newName: "MinCost");

            migrationBuilder.RenameColumn(
                name: "maxCost",
                table: "Filaments",
                newName: "MaxCost");

            migrationBuilder.RenameColumn(
                name: "lastCost",
                table: "Filaments",
                newName: "LastCost");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Filaments",
                newName: "LastPurchaseDate");

            migrationBuilder.RenameColumn(
                name: "zSeparationForSupports",
                table: "FilamentProfiles",
                newName: "ZSeparationForSupports");

            migrationBuilder.RenameColumn(
                name: "slopeAngleForSupports",
                table: "FilamentProfiles",
                newName: "SlopeAngleForSupports");

            migrationBuilder.AddColumn<bool>(
                name: "BuyAgain",
                table: "Filaments",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BuyLink",
                table: "Filaments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FilamentColorId",
                table: "Filaments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<decimal>(
                name: "ZSeparationForSupports",
                table: "FilamentProfiles",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<int>(
                name: "SlopeAngleForSupports",
                table: "FilamentProfiles",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<Guid>(
                name: "BrandId",
                table: "FilamentProfiles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "MaterialTypeId",
                table: "FilamentProfiles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Brands",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FilamentColors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ColorCode = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FilamentColors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MaterialType",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaterialType", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Filaments_FilamentColorId",
                table: "Filaments",
                column: "FilamentColorId");

            migrationBuilder.CreateIndex(
                name: "IX_FilamentProfiles_BrandId",
                table: "FilamentProfiles",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_FilamentProfiles_MaterialTypeId",
                table: "FilamentProfiles",
                column: "MaterialTypeId");

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
                name: "FK_Filaments_FilamentColors_FilamentColorId",
                table: "Filaments",
                column: "FilamentColorId",
                principalTable: "FilamentColors",
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
                name: "FK_FilamentProfiles_MaterialType_MaterialTypeId",
                table: "FilamentProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_Filaments_FilamentColors_FilamentColorId",
                table: "Filaments");

            migrationBuilder.DropTable(
                name: "Brands");

            migrationBuilder.DropTable(
                name: "FilamentColors");

            migrationBuilder.DropTable(
                name: "MaterialType");

            migrationBuilder.DropIndex(
                name: "IX_Filaments_FilamentColorId",
                table: "Filaments");

            migrationBuilder.DropIndex(
                name: "IX_FilamentProfiles_BrandId",
                table: "FilamentProfiles");

            migrationBuilder.DropIndex(
                name: "IX_FilamentProfiles_MaterialTypeId",
                table: "FilamentProfiles");

            migrationBuilder.DropColumn(
                name: "BuyAgain",
                table: "Filaments");

            migrationBuilder.DropColumn(
                name: "BuyLink",
                table: "Filaments");

            migrationBuilder.DropColumn(
                name: "FilamentColorId",
                table: "Filaments");

            migrationBuilder.DropColumn(
                name: "BrandId",
                table: "FilamentProfiles");

            migrationBuilder.DropColumn(
                name: "MaterialTypeId",
                table: "FilamentProfiles");

            migrationBuilder.RenameColumn(
                name: "MinCost",
                table: "Filaments",
                newName: "minCost");

            migrationBuilder.RenameColumn(
                name: "MaxCost",
                table: "Filaments",
                newName: "maxCost");

            migrationBuilder.RenameColumn(
                name: "LastCost",
                table: "Filaments",
                newName: "lastCost");

            migrationBuilder.RenameColumn(
                name: "LastPurchaseDate",
                table: "Filaments",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "ZSeparationForSupports",
                table: "FilamentProfiles",
                newName: "zSeparationForSupports");

            migrationBuilder.RenameColumn(
                name: "SlopeAngleForSupports",
                table: "FilamentProfiles",
                newName: "slopeAngleForSupports");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "PrintJobs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Filaments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CustomNozzleTemp",
                table: "Filaments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SpoolEmptyWeightGrams",
                table: "Filaments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalWeightGrams",
                table: "Filaments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<decimal>(
                name: "zSeparationForSupports",
                table: "FilamentProfiles",
                type: "numeric",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "slopeAngleForSupports",
                table: "FilamentProfiles",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Brand",
                table: "FilamentProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IroningSupported",
                table: "FilamentProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaterialSubType",
                table: "FilamentProfiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaterialType",
                table: "FilamentProfiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
