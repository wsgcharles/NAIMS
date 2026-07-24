namespace EduCore.API.Helpers;

public class SmtpSettings
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 25;
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string SenderName { get; set; } = "EduCore System";
    public string SenderEmail { get; set; } = "noreply@educore.local";
    public bool EnableSsl { get; set; } = false;
    public string? ReplyToAddress { get; set; }
}
