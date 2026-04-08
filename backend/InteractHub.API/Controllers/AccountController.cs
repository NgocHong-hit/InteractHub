using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using InteractHub.API.DTOs.Account;
using InteractHub.API.Interfaces;
using Microsoft.AspNetCore.Authorization;

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

        [HttpGet("admin-only")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAdminDashboard()
        {
            return Ok("Chào sếp Admin!");
        }
            }

    
}