using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using InteractHub.API.Data;
using InteractHub.API.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Lấy chuỗi kết nối từ appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. Đăng ký DbContext với SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// 3. Đăng ký Identity (Phải có để dùng bảng User kế thừa IdentityUser)
builder.Services.AddIdentity<User, IdentityRole<int>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Cấu hình HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication(); // Phải đứng trước Authorization
app.UseAuthorization();

app.MapControllers();

app.Run();