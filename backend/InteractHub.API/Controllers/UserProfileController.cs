using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InteractHub.API.Models;

namespace InteractHub.API.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
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
                    u.PhoneNumber,
                    u.CreatedAt,
                    u.Gender,
                    u.Address,
                    u.DateOfBirth
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng trong hệ thống" });

            return Ok(user);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("nameid");
            if (userIdClaim == null)
                return Unauthorized(new { message = "Không tìm thấy định danh trong Token" });

            var userId = int.Parse(userIdClaim.Value);
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng trong hệ thống" });

            if (dto.FullName != null) user.FullName = dto.FullName;
            if (dto.Bio != null) user.Bio = dto.Bio;
            if (dto.AvatarUrl != null) user.AvatarUrl = dto.AvatarUrl;
            if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
            if (dto.Gender != null) user.Gender = dto.Gender;
            if (dto.Address != null) user.Address = dto.Address;
            if (!string.IsNullOrWhiteSpace(dto.DateOfBirth) && DateTime.TryParse(dto.DateOfBirth, out var parsedDate))
            {
                user.DateOfBirth = parsedDate;
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { message = "Cập nhật profile thành công" });
        }
    }
}
