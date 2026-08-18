using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTrackAndStrandSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_AcademicYears_AcademicYearId",
                table: "Enrollments");

            migrationBuilder.AlterColumn<int>(
                name: "EnrollmentId",
                table: "StudentBills",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "EnrollmentApplicationId",
                table: "StudentBills",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FinancialClearanceStatus",
                table: "StudentBills",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Strand",
                table: "EnrollmentApplications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Track",
                table: "EnrollmentApplications",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EnrollmentHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<int>(type: "integer", nullable: false),
                    AcademicYearId = table.Column<int>(type: "integer", nullable: false),
                    GradeLevelId = table.Column<int>(type: "integer", nullable: false),
                    SectionId = table.Column<int>(type: "integer", nullable: true),
                    EnrolledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EnrollmentStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EnrolledByEmployeeId = table.Column<int>(type: "integer", nullable: true),
                    SnapshotJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnrollmentHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EnrollmentHistories_AcademicYears_AcademicYearId",
                        column: x => x.AcademicYearId,
                        principalTable: "AcademicYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EnrollmentHistories_Employees_EnrolledByEmployeeId",
                        column: x => x.EnrolledByEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EnrollmentHistories_GradeLevels_GradeLevelId",
                        column: x => x.GradeLevelId,
                        principalTable: "GradeLevels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EnrollmentHistories_Sections_SectionId",
                        column: x => x.SectionId,
                        principalTable: "Sections",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EnrollmentHistories_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StudentBills_EnrollmentApplicationId",
                table: "StudentBills",
                column: "EnrollmentApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplications_VerificationSlipNumber",
                table: "EnrollmentApplications",
                column: "VerificationSlipNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentHistories_AcademicYearId",
                table: "EnrollmentHistories",
                column: "AcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentHistories_EnrolledByEmployeeId",
                table: "EnrollmentHistories",
                column: "EnrolledByEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentHistories_GradeLevelId",
                table: "EnrollmentHistories",
                column: "GradeLevelId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentHistories_SectionId",
                table: "EnrollmentHistories",
                column: "SectionId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentHistories_StudentId",
                table: "EnrollmentHistories",
                column: "StudentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_AcademicYears_AcademicYearId",
                table: "Enrollments",
                column: "AcademicYearId",
                principalTable: "AcademicYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentBills_EnrollmentApplications_EnrollmentApplicationId",
                table: "StudentBills",
                column: "EnrollmentApplicationId",
                principalTable: "EnrollmentApplications",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_AcademicYears_AcademicYearId",
                table: "Enrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentBills_EnrollmentApplications_EnrollmentApplicationId",
                table: "StudentBills");

            migrationBuilder.DropTable(
                name: "EnrollmentHistories");

            migrationBuilder.DropIndex(
                name: "IX_StudentBills_EnrollmentApplicationId",
                table: "StudentBills");

            migrationBuilder.DropIndex(
                name: "IX_EnrollmentApplications_VerificationSlipNumber",
                table: "EnrollmentApplications");

            migrationBuilder.DropColumn(
                name: "EnrollmentApplicationId",
                table: "StudentBills");

            migrationBuilder.DropColumn(
                name: "FinancialClearanceStatus",
                table: "StudentBills");

            migrationBuilder.DropColumn(
                name: "Strand",
                table: "EnrollmentApplications");

            migrationBuilder.DropColumn(
                name: "Track",
                table: "EnrollmentApplications");

            migrationBuilder.AlterColumn<int>(
                name: "EnrollmentId",
                table: "StudentBills",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_AcademicYears_AcademicYearId",
                table: "Enrollments",
                column: "AcademicYearId",
                principalTable: "AcademicYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
