using System.Text;
using AlmoxarifadoSenai.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);

LoadEnvFile(Path.Combine(builder.Environment.ContentRootPath, ".env"));
ConfigureFirebaseCredentials(builder.Environment);

builder.Services.AddHealthChecks();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>()
            ?? Array.Empty<string>();

        if (allowedOrigins.Length == 0 && builder.Environment.IsDevelopment())
        {
            allowedOrigins = new[]
            {
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            };
        }

        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


builder.Services.AddControllers();

builder.Services.AddSingleton<FirestoreService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Almoxarifado SENAI API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Digite o token JWT aqui."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddScoped<JwtService>();

var chave = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(chave))
{
    throw new InvalidOperationException("Configure a variavel Jwt__Key antes de iniciar a API.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(chave!)
            )
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        var result = new
        {
            status = report.Status.ToString(),
            timestamp = DateTime.UtcNow,
            services = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString()
            })
        };
        await context.Response.WriteAsJsonAsync(result);
    }
});

app.Run();

static void LoadEnvFile(string path)
{
    if (!File.Exists(path))
    {
        return;
    }

    foreach (var rawLine in File.ReadAllLines(path))
    {
        var line = rawLine.Trim();

        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#"))
        {
            continue;
        }

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0)
        {
            continue;
        }

        var key = line[..separatorIndex].Trim();
        var value = line[(separatorIndex + 1)..].Trim().Trim('"');

        if (!string.IsNullOrWhiteSpace(key))
        {
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}

static void ConfigureFirebaseCredentials(IWebHostEnvironment environment)
{
    var credentialsJson = Environment.GetEnvironmentVariable("FIREBASE_CREDENTIALS_JSON");

    if (!string.IsNullOrWhiteSpace(credentialsJson))
    {
        var credentialsPath = Path.Combine(Path.GetTempPath(), "firebase-credentials.json");
        File.WriteAllText(credentialsPath, credentialsJson);
        Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);
        return;
    }

    var localCredentialsPath = Path.Combine(
        environment.ContentRootPath,
        "firebase-credentials.json"
    );

    if (File.Exists(localCredentialsPath))
    {
        Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", localCredentialsPath);
    }
}
