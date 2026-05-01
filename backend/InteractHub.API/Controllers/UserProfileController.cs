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
        private readonly IWebHostEnvironment _env;

        public UserProfileController(UserManager<User> userManager, IWebHostEnvironment env)
        {
            _userManager = userManager;
            _env = env;
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

        // Xem profile của user khác theo ID
        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetUserById(int userId)
        {
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
                return NotFound(new { message = "Không tìm thấy người dùng" });

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

        // Upload ảnh đại diện
        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn ảnh" });

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest(new { message = "Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP" });

            // Validate file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "Ảnh không được vượt quá 5MB" });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("nameid");
            if (userIdClaim == null)
                return Unauthorized(new { message = "Không tìm thấy định danh trong Token" });

            var userId = int.Parse(userIdClaim.Value);
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng" });

            // Save file
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "avatars");
            Directory.CreateDirectory(uploadsFolder);

            var fileExtension = Path.GetExtension(file.FileName);
            var fileName = $"avatar_{userId}_{DateTime.UtcNow.Ticks}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update user avatar URL
            var avatarUrl = $"/uploads/avatars/{fileName}";
            user.AvatarUrl = avatarUrl;
            await _userManager.UpdateAsync(user);

            return Ok(new { avatarUrl });
        }
    }
}
