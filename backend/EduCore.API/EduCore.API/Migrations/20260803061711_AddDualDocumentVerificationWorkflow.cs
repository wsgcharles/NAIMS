using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDualDocumentVerificationWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DigitalStatus",
                table: "EnrollmentApplicationDocuments",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OriginalRemarks",
                table: "EnrollmentApplicationDocuments",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OriginalStatus",
                table: "EnrollmentApplicationDocuments",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "OriginalSubmittedAt",
                table: "EnrollmentApplicationDocuments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OriginalVerifiedAt",
                table: "EnrollmentApplicationDocuments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OriginalVerifiedByEmployeeId",
                table: "EnrollmentApplicationDocuments",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplicationDocuments_OriginalVerifiedByEmployeeId",
                table: "EnrollmentApplicationDocuments",
                column: "OriginalVerifiedByEmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentApplicationDocuments_Employees_OriginalVerifiedBy~",
                table: "EnrollmentApplicationDocuments",
                column: "OriginalVerifiedByEmployeeId",
                principalTable: "Employees",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentApplicationDocuments_Employees_OriginalVerifiedBy~",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropIndex(
                name: "IX_EnrollmentApplicationDocuments_OriginalVerifiedByEmployeeId",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "DigitalStatus",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "OriginalRemarks",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "OriginalStatus",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "OriginalSubmittedAt",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "OriginalVerifiedAt",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "OriginalVerifiedByEmployeeId",
                table: "EnrollmentApplicationDocuments");
        }
    }
}
