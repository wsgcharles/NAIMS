using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSemesterAndSchoolCalendarFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StudentNumberCounterLength",
                table: "SchoolSettings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ClassesEndDate",
                table: "AcademicYears",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ClassesStartDate",
                table: "AcademicYears",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentSemester",
                table: "AcademicYears",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "GraduationDate",
                table: "AcademicYears",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsReturningEnrollmentOpen",
                table: "AcademicYears",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "SchoolSettings",
                keyColumn: "Id",
                keyValue: 1,
                column: "StudentNumberCounterLength",
                value: 6);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StudentNumberCounterLength",
                table: "SchoolSettings");

            migrationBuilder.DropColumn(
                name: "ClassesEndDate",
                table: "AcademicYears");

            migrationBuilder.DropColumn(
                name: "ClassesStartDate",
                table: "AcademicYears");

            migrationBuilder.DropColumn(
                name: "CurrentSemester",
                table: "AcademicYears");

            migrationBuilder.DropColumn(
                name: "GraduationDate",
                table: "AcademicYears");

            migrationBuilder.DropColumn(
                name: "IsReturningEnrollmentOpen",
                table: "AcademicYears");
        }
    }
}
