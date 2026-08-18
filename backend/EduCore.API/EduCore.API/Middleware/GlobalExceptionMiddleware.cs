using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace EduCore.API.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = Guid.NewGuid().ToString();
        context.Response.Headers["X-Correlation-ID"] = correlationId;

        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var userEmail = context.User?.FindFirst(ClaimTypes.Email)?.Value ??
                            context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                            "Anonymous";
            var requestPath = context.Request.Path;
            var requestMethod = context.Request.Method;

            _logger.LogError(ex,
                "Unhandled Exception [{CorrelationId}] | User: {UserEmail} | Method: {Method} | Path: {Path} | Message: {Message}",
                correlationId, userEmail, requestMethod, requestPath, ex.Message);

            if (context.Response.HasStarted)
            {
                _logger.LogWarning("Response has already started, cannot modify status code for correlation [{CorrelationId}]", correlationId);
                return;
            }

            context.Response.ContentType = "application/json";

            if (ex is InvalidOperationException invEx && invEx.Message.Contains(':'))
            {
                var parts = invEx.Message.Split(':', 2);
                var code = parts[0];
                var message = parts[1];

                int statusCode = code switch
                {
                    "PARENT_EMAIL_REQUIRED" => 400,
                    "EMPLOYEE_NOT_FOUND" => 401,
                    "UNAUTHORIZED_EMPLOYEE" => 403,
                    "ENROLLMENT_PREREQUISITE_FAILED" => 409,
                    _ => 400
                };

                context.Response.StatusCode = statusCode;

                var domainErrorPayload = new
                {
                    code = code,
                    message = message,
                    correlationId = correlationId
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(domainErrorPayload));
                return;
            }

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            var errorPayload = new
            {
                code = "UNEXPECTED_ERROR",
                message = "An unexpected server error occurred.",
                correlationId = correlationId
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(errorPayload));
        }
    }
}
