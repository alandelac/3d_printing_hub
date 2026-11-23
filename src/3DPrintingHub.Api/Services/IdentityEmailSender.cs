using System.Net;
using System.Net.Mail;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace _3DPrintingHub.Api.Services;

public class IdentityEmailSender(
    IConfiguration configuration,
    ILogger<IdentityEmailSender> logger) : IEmailSender<IdentityUser>
{
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger<IdentityEmailSender> _logger = logger;

    public async Task SendPasswordResetCodeAsync(IdentityUser user, string email, string resetCode)
    {
        var frontendUrl = GetFrontendBaseUrl();
        var resetLink = $"{frontendUrl}/reset-password?email={Uri.EscapeDataString(email)}&resetCode={Uri.EscapeDataString(resetCode)}";

        _logger.LogInformation(
            "[Password Recovery] Password reset code for {Email}: {ResetCode}. Reset Link: {ResetLink}",
            email, resetCode, resetLink);

        await TrySendEmailAsync(
            toEmail: email,
            subject: "Reset your 3DPrintingHub password",
            bodyHtml: $@"<h2>Password Reset</h2>
<p>You requested a password reset for your 3DPrintingHub account.</p>
<p>Your password reset code is: <strong>{resetCode}</strong></p>
<p>You can also reset your password directly by clicking the link below:</p>
<p><a href=""{resetLink}"">Reset your password</a></p>
<p>If you did not make this request, you can safely ignore this email.</p>",
            bodyText: $@"Password Reset
You requested a password reset for your 3DPrintingHub account.
Your password reset code is: {resetCode}
Reset link: {resetLink}

If you did not make this request, you can safely ignore this email."
        );
    }

    public async Task SendPasswordResetLinkAsync(IdentityUser user, string email, string resetLink)
    {
        _logger.LogInformation(
            "[Password Recovery] Password reset link for {Email}: {ResetLink}",
            email, resetLink);

        await TrySendEmailAsync(
            toEmail: email,
            subject: "Reset your 3DPrintingHub password",
            bodyHtml: $@"<h2>Password Reset</h2>
<p>You requested a password reset for your 3DPrintingHub account.</p>
<p><a href=""{resetLink}"">Click here to reset your password</a></p>
<p>If you did not make this request, you can safely ignore this email.</p>",
            bodyText: $@"Password Reset
You requested a password reset for your 3DPrintingHub account.
Reset link: {resetLink}

If you did not make this request, you can safely ignore this email."
        );
    }

    public async Task SendConfirmationLinkAsync(IdentityUser user, string email, string confirmationLink)
    {
        _logger.LogInformation(
            "[Account Confirmation] Confirmation link for {Email}: {ConfirmationLink}",
            email, confirmationLink);

        await TrySendEmailAsync(
            toEmail: email,
            subject: "Confirm your 3DPrintingHub account",
            bodyHtml: $@"<h2>Account Confirmation</h2>
<p>Please confirm your 3DPrintingHub account by clicking the link below:</p>
<p><a href=""{confirmationLink}"">Confirm Account</a></p>",
            bodyText: $@"Account Confirmation
Please confirm your 3DPrintingHub account using the link below:
{confirmationLink}"
        );
    }

    private string GetFrontendBaseUrl()
    {
        var configured = _configuration["FRONTEND_URL"] ?? _configuration["AllowedOrigin"];
        if (string.IsNullOrWhiteSpace(configured))
        {
            return "http://localhost:4200";
        }

        return configured.TrimEnd('/');
    }

    private async Task TrySendEmailAsync(string toEmail, string subject, string bodyHtml, string bodyText)
    {
        var smtpHost = _configuration["Smtp:Host"];
        if (string.IsNullOrWhiteSpace(smtpHost))
        {
            return;
        }

        try
        {
            var port = _configuration.GetValue<int>("Smtp:Port", 587);
            var enableSsl = _configuration.GetValue<bool>("Smtp:EnableSsl", true);
            var username = _configuration["Smtp:Username"];
            var password = _configuration["Smtp:Password"];
            var fromEmail = _configuration["Smtp:FromEmail"] ?? "noreply@3dprintinghub.local";
            var fromName = _configuration["Smtp:FromName"] ?? "3D Printing Hub";

            using var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = bodyHtml,
                IsBodyHtml = true
            };
            message.To.Add(toEmail);

            using var smtpClient = new SmtpClient(smtpHost, port)
            {
                EnableSsl = enableSsl
            };

            if (!string.IsNullOrWhiteSpace(username))
            {
                smtpClient.Credentials = new NetworkCredential(username, password);
            }

            await smtpClient.SendMailAsync(message);
            _logger.LogInformation("Password reset email sent to {Email} via SMTP ({Host}:{Port})", toEmail, smtpHost, port);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email} via SMTP. The action link/code was logged above.", toEmail);
        }
    }
}
