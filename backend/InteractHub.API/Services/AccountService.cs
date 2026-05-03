using InteractHub.API.DTOs.Account;
using InteractHub.API.Interfaces;
using InteractHub.API.Models;
using Microsoft.AspNetCore.Identity;

namespace InteractHub.API.Services
{
    public class AccountService : IAccountService
    {
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;

        public AccountService(UserManager<User> userManager, ITokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        public async Task<object> RegisterAsync(RegisterDto registerDto)
        {
            var user = new User
            {
                UserName = registerDto.Email.Split('@')[0],
                Email = registerDto.Email,
                FullName = registerDto.FullName,
                PhoneNumber = registerDto.PhoneNumber,
                Gender = registerDto.Gender,
                DateOfBirth = registerDto.DateOfBirth,
                Address = registerDto.Address,
                CreatedAt = DateTime.Now
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded) return result.Errors;

            // Gán quyền mặc định
            await _userManager.AddToRoleAsync(user, "User");
            var roles = new List<string> { "User" };

            return new {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                role = "User",
                avatarUrl = user.AvatarUrl,
                // CẬP NHẬT: Truyền roles vào đây
                token = _tokenService.CreateToken(user, roles) 
            };
        }

        public async Task<object> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.UserName) 
                       ?? await _userManager.FindByNameAsync(loginDto.UserName);

            if (user == null) return "Tên đăng nhập hoặc Email không tồn tại!";

            var passwordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!passwordValid) return "Mật khẩu không chính xác!";

            // 1. Lấy danh sách quyền từ Database
            var roles = await _userManager.GetRolesAsync(user);
            var userRole = roles.FirstOrDefault() ?? "User"; 

            // 2. Trả về Object đầy đủ
            return new {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                fullName = user.FullName,
                address = user.Address,
                gender = user.Gender,
                dateOfBirth = user.DateOfBirth,
                avatarUrl = user.AvatarUrl,
                role = userRole, // Trả thêm trường này để Frontend dễ check if/else
                // CẬP NHẬT: Truyền roles vào để Token có "dấu mộc" Admin
                token = _tokenService.CreateToken(user, roles) 
            };
        }

        public async Task<IdentityResult> ChangePasswordAsync(string userId, ChangePasswordDto dto)
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return IdentityResult.Failed(new IdentityError { Description = "Người dùng không tồn tại." });
                }

                // Trả về kết quả trực tiếp từ hàm của Identity
                // Hàm này trả về IdentityResult, khớp hoàn toàn với Interface
                var result = await _userManager.ChangePasswordAsync(user, dto.OldPassword, dto.NewPassword);
                return result;
            }
    }
}