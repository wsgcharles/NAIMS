namespace EduCore.API.DTOs;

public class StudentRecordResponse
{
    public int StudentId { get; set; }

    public PersonalInfoResponse PersonalInformation { get; set; } = new();

    public ParentInfoResponse? Parent { get; set; }

    public CurrentEnrollmentResponse CurrentEnrollment { get; set; } = new();

    public List<CurrentSubjectResponse> Subjects { get; set; } = new();

    public List<CurrentGradeResponse> Grades { get; set; } = new();
}