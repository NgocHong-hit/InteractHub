using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InteractHub.API.DTOs.Account;
using InteractHub.API.Interfaces;
using InteractHub.API.Models;

namespace InteractHub.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;
        private readonly SignInManager<User> _signInManager;

        public AccountController(UserManager<User> userManager, ITokenService tokenService, SignInManager<User> signInManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signInManager;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = new User
            {
                UserName = registerDto.Email.Split('@')[0], // Tự cắt lấy phần trước @ làm UserName
                Email = registerDto.Email,
                FullName = registerDto.FullName,
                PhoneNumber = registerDto.PhoneNumber,
                Gender = registerDto.Gender,
                DateOfBirth = registerDto.DateOfBirth,
                Address = registerDto.Address,
                CreatedAt = DateTime.Now
            };
            var createdUser = await _userManager.CreateAsync(user, registerDto.Password);

            if (createdUser.Succeeded)
            {
                // Gán quyền mặc định là User
                var roleResult = await _userManager.AddToRoleAsync(user, "User");
                if (roleResult.Succeeded)
                {
                    return Ok(new {
                        UserName = user.UserName,
                        Email = user.Email,
                        Token = _tokenService.CreateToken(user)
                    });
                }
                return BadRequest(roleResult.Errors);
            }
            return BadRequest(createdUser.Errors);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // TÌM KIẾM THÔNG MINH: Thử tìm theo Email, nếu không thấy thử tìm theo UserName
            var user = await _userManager.FindByEmailAsync(loginDto.UserName);
            if (user == null)
            {
                user = await _userManager.FindByNameAsync(loginDto.UserName);
            }

            if (user == null) return Unauthorized("Tên đăng nhập hoặc Email không tồn tại!");

            // Kiểm tra mật khẩu trực tiếp
            var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);

            if (!result) return Unauthorized("Mật khẩu không chính xác!");

            return Ok(new {
                UserName = user.UserName,
                Email = user.Email,
                Token = _tokenService.CreateToken(user)
            });
        }
    }
}