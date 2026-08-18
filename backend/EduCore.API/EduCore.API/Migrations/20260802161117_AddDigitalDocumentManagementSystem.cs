using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDigitalDocumentManagementSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContentType",
                table: "EnrollmentApplicationDocuments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "EnrollmentApplicationDocuments",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "EnrollmentApplicationDocuments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "OriginalFilename",
                table: "EnrollmentApplicationDocuments",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParentDocumentId",
                table: "EnrollmentApplicationDocuments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StoragePath",
                table: "EnrollmentApplicationDocuments",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StoredFilename",
                table: "EnrollmentApplicationDocuments",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UploadedAt",
                table: "EnrollmentApplicationDocuments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UploadedByUserId",
                table: "EnrollmentApplicationDocuments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "EnrollmentApplicationDocuments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplicationDocuments_ParentDocumentId",
                table: "EnrollmentApplicationDocuments",
                column: "ParentDocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplicationDocuments_UploadedByUserId",
                table: "EnrollmentApplicationDocuments",
                column: "UploadedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentApplicationDocuments_EnrollmentApplicationDocumen~",
                table: "EnrollmentApplicationDocuments",
                column: "ParentDocumentId",
                principalTable: "EnrollmentApplicationDocuments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentApplicationDocuments_Users_UploadedByUserId",
                table: "EnrollmentApplicationDocuments",
                column: "UploadedByUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentApplicationDocuments_EnrollmentApplicationDocumen~",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentApplicationDocuments_Users_UploadedByUserId",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropIndex(
                name: "IX_EnrollmentApplicationDocuments_ParentDocumentId",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropIndex(
                name: "IX_EnrollmentApplicationDocuments_UploadedByUserId",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "ContentType",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "OriginalFilename",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "ParentDocumentId",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "StoragePath",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "StoredFilename",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "UploadedAt",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "UploadedByUserId",
                table: "EnrollmentApplicationDocuments");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "EnrollmentApplicationDocuments");
        }
    }
}
