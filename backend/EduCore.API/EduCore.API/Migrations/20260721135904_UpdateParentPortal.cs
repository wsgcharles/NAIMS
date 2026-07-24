using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateParentPortal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Enrollment_Employees_ApprovedByEmployeeId",
                table: "Enrollment");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollment_Sections_SectionId",
                table: "Enrollment");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollment_Students_StudentId",
                table: "Enrollment");

            migrationBuilder.DropForeignKey(
                name: "FK_Grades_Enrollment_EnrollmentId",
                table: "Grades");

            migrationBuilder.DropForeignKey(
                name: "FK_Parent_Users_UserId",
                table: "Parent");

            migrationBuilder.DropForeignKey(
                name: "FK_Students_Parent_ParentId",
                table: "Students");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Parent",
                table: "Parent");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Enrollment",
                table: "Enrollment");

            migrationBuilder.RenameTable(
                name: "Parent",
                newName: "Parents");

            migrationBuilder.RenameTable(
                name: "Enrollment",
                newName: "Enrollments");

            migrationBuilder.RenameIndex(
                name: "IX_Parent_UserId",
                table: "Parents",
                newName: "IX_Parents_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Enrollment_StudentId",
                table: "Enrollments",
                newName: "IX_Enrollments_StudentId");

            migrationBuilder.RenameIndex(
                name: "IX_Enrollment_SectionId",
                table: "Enrollments",
                newName: "IX_Enrollments_SectionId");

            migrationBuilder.RenameIndex(
                name: "IX_Enrollment_EnrollmentNumber",
                table: "Enrollments",
                newName: "IX_Enrollments_EnrollmentNumber");

            migrationBuilder.RenameIndex(
                name: "IX_Enrollment_ApprovedByEmployeeId",
                table: "Enrollments",
                newName: "IX_Enrollments_ApprovedByEmployeeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Parents",
                table: "Parents",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Enrollments",
                table: "Enrollments",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_Employees_ApprovedByEmployeeId",
                table: "Enrollments",
                column: "ApprovedByEmployeeId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_Sections_SectionId",
                table: "Enrollments",
                column: "SectionId",
                principalTable: "Sections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_Students_StudentId",
                table: "Enrollments",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Grades_Enrollments_EnrollmentId",
                table: "Grades",
                column: "EnrollmentId",
                principalTable: "Enrollments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Parents_Users_UserId",
                table: "Parents",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Students_Parents_ParentId",
                table: "Students",
                column: "ParentId",
                principalTable: "Parents",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_Employees_ApprovedByEmployeeId",
                table: "Enrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_Sections_SectionId",
                table: "Enrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_Students_StudentId",
                table: "Enrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Grades_Enrollments_EnrollmentId",
                table: "Grades");

            migrationBuilder.DropForeignKey(
                name: "FK_Parents_Users_UserId",
                table: "Parents");

            migrationBuilder.DropForeignKey(
                name: "FK_Students_Parents_ParentId",
                table: "Students");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Parents",
                table: "Parents");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Enrollments",
                table: "Enrollments");

            migrationBuilder.RenameTable(
                name: "Parents",
                newName: "Parent");

            migrationBuilder.RenameTable(
                name: "Enrollments",
                newName: "Enrollment");

            migrationBuilder.RenameIndex(
                name: "IX_Parents_UserId",
                table: "Parent",
                newName: "IX_Parent_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Enrollments_StudentId",
                table: "Enrollment",
                newName: "IX_Enrollment_StudentId");

            migrationBuilder.RenameIndex(
                name: "IX_Enrollments_SectionId",
                table: "Enrollment",
                newName: "IX_Enrollment_SectionId");

            migrationBuilder.RenameIndex(
                name: "IX_Enrollments_EnrollmentNumber",
                table: "Enrollment",
                newName: "IX_Enrollment_EnrollmentNumber");

            migrationBuilder.RenameIndex(
                name: "IX_Enrollments_ApprovedByEmployeeId",
                table: "Enrollment",
                newName: "IX_Enrollment_ApprovedByEmployeeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Parent",
                table: "Parent",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Enrollment",
                table: "Enrollment",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollment_Employees_ApprovedByEmployeeId",
                table: "Enrollment",
                column: "ApprovedByEmployeeId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollment_Sections_SectionId",
                table: "Enrollment",
                column: "SectionId",
                principalTable: "Sections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollment_Students_StudentId",
                table: "Enrollment",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Grades_Enrollment_EnrollmentId",
                table: "Grades",
                column: "EnrollmentId",
                principalTable: "Enrollment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Parent_Users_UserId",
                table: "Parent",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Students_Parent_ParentId",
                table: "Students",
                column: "ParentId",
                principalTable: "Parent",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
