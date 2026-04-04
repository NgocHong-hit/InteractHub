using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using InteractHub.API.Data;
using InteractHub.API.Models;
using InteractHub.API.Interfaces;
using InteractHub.API.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json; // Thêm dòng này

// --- QUAN TRỌNG: Ngăn ASP.NET Core tự đổi tên Claim (ví dụ: sub thành NameIdentifier) ---
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// --- 1. KẾT NỐI DATABASE ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// --- 2. CẤU HÌNH IDENTITY ---
builder.Services.AddIdentity<User, IdentityRole<int>>(options => {
    options.User.RequireUniqueEmail = true; 
    options.SignIn.RequireConfirmedEmail = false; 
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    
    // Đồng bộ Claim loại ID người dùng
    options.ClaimsIdentity.UserIdClaimType = JwtRegisteredClaimNames.NameId;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// --- 3. CẤU HÌNH JWT ---
var jwtKey = "Day_La_Chuoi_Key_Sieu_Bao_Mat_Dai_Tren_64_Ky_Tu_De_Khong_Bao_Gio_Loi_Nua_123456";

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = false,    
        ValidateAudience = false,  
        ValidateLifetime = true,   
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        NameClaimType = JwtRegisteredClaimNames.GivenName, // Để lấy được UserName
        RoleClaimType = "role"
    };
});

// --- 4. CẤU HÌNH SWAGGER ---
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "InteractHub API", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Vui lòng nhập: Bearer [Token]",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey, 
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[]{}
        }
    });
});

// --- 5. CORS ---
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactApp", policy => {
        policy.WithOrigins("http://localhost:5173") 
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Giữ nguyên tên biến như trong C# hoặc ép về camelCase (chữ đầu thường)
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// --- 7. SEED ROLE ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<int>>>();
        string[] roleNames = { "Admin", "User" };
        foreach (var roleName in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole<int> { Name = roleName });
            }
        }
    }
    catch (Exception ex) { Console.WriteLine("Lỗi Seed Role: " + ex.Message); }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication(); 
app.UseAuthorization(); 
app.MapControllers();
app.Run();