using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using InteractHub.API.DTOs.Account;
using InteractHub.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace InteractHub.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var result = await _accountService.RegisterAsync(registerDto);
            if (result is IEnumerable<IdentityError> errors) return BadRequest(errors);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _accountService.LoginAsync(loginDto);
            if (result is string errorMessage) return Unauthorized(errorMessage);
            return Ok(result);
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            // Validate model state
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors);
                return BadRequest(errors.Select(e => new { message = e.ErrorMessage }));
            }

            // Lấy UserId từ Claims trong Token
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _accountService.ChangePasswordAsync(userId, model);

            if (result.Succeeded)
            {
                return Ok(new { message = "Đổi mật khẩu thành công " });
            }

            // Nếu lỗi (mật khẩu cũ sai, hoặc mật khẩu mới không đủ mạnh)
            return BadRequest(result.Errors);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            var result = await _accountService.ForgotPasswordAsync(dto.Email);
            return Ok(result);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _accountService.ResetPasswordAsync(dto);
            if (result.Succeeded)
            {
                return Ok(new { success = true, message = "Khôi phục mật khẩu thành công." });
            }

            return BadRequest(new { success = false, message = "Không thể khôi phục mật khẩu.", errors = result.Errors });
        }

        [HttpGet("admin-only")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAdminDashboard()
        {
            return Ok("Chào sếp Admin!");
        }
    }
}