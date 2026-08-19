namespace EduCore.API.Helpers;

public class SmtpSettings
{
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public string? Username { get; set; } = "charlesuday12@gmail.com";
    public string? Password { get; set; }
    public string SenderName { get; set; } = "Noah's Academy Incorporated";
    public string SenderEmail { get; set; } = "charlesuday12@gmail.com";

    /// <summary>
    /// Must be true for Gmail port 587 (STARTTLS).
    /// If false, Gmail will reject the connection or send unencrypted which Gmail drops.
    /// </summary>
    public bool EnableSsl { get; set; } = true;

    public string? ReplyToAddress { get; set; }

    /// <summary>
    /// When set, EmailService uses Brevo's HTTP API (HTTPS port 443) instead of SMTP.
    /// Required for cloud deployments (e.g. Render free tier) that block outbound port 587.
    /// Get this from Brevo Dashboard → SMTP & API → API Keys.
    /// </summary>
    public string? BrevoApiKey { get; set; }
}
