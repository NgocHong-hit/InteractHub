using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InteractHub.API.Models;

namespace InteractHub.API.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)] // Chỉ định rõ dùng JWT
[ApiController]
[Route("api/[controller]")]
public class UserProfileController : ControllerBase
{
    private readonly UserManager<User> _userManager;

    public UserProfileController(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        // Lấy UserId từ Claim "nameid" mà mình đã cấu hình trong TokenService
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("nameid");
        
        if (userIdClaim == null)
            return Unauthorized(new { message = "Không tìm thấy định danh trong Token" });

        var userId = int.Parse(userIdClaim.Value);

        var user = await _userManager.Users
            .Where(u => u.Id == userId)
            .Select(u => new 
            {
                u.Id,
                u.FullName,
                u.UserName,
                u.Email,
                u.AvatarUrl,
                u.Bio,
                u.CreatedAt,
                u.Gender,    // Thêm các trường mới bạn vừa tạo
                u.Address,
                u.DateOfBirth
            })
            .FirstOrDefaultAsync();

        if (user == null) return NotFound("Không tìm thấy người dùng trong hệ thống");

        return Ok(user);
    }
}
}