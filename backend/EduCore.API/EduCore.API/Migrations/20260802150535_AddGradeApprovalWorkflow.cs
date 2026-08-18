using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGradeApprovalWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "Grades",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovedByEmployeeId",
                table: "Grades",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewerRemarks",
                table: "Grades",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Grades",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmittedAt",
                table: "Grades",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Grades_ApprovedByEmployeeId",
                table: "Grades",
                column: "ApprovedByEmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Grades_Employees_ApprovedByEmployeeId",
                table: "Grades",
                column: "ApprovedByEmployeeId",
                principalTable: "Employees",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Grades_Employees_ApprovedByEmployeeId",
                table: "Grades");

            migrationBuilder.DropIndex(
                name: "IX_Grades_ApprovedByEmployeeId",
                table: "Grades");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "Grades");

            migrationBuilder.DropColumn(
                name: "ApprovedByEmployeeId",
                table: "Grades");

            migrationBuilder.DropColumn(
                name: "ReviewerRemarks",
                table: "Grades");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Grades");

            migrationBuilder.DropColumn(
                name: "SubmittedAt",
                table: "Grades");
        }
    }
}
