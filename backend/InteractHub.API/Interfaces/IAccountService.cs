using InteractHub.API.DTOs.Account;
using Microsoft.AspNetCore.Identity;

namespace InteractHub.API.Interfaces
{
    public interface IAccountService
    {
        Task<object> RegisterAsync(RegisterDto registerDto);
        Task<object> LoginAsync(LoginDto loginDto);
        Task<IdentityResult> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
        Task<object> ForgotPasswordAsync(string email);
        Task<IdentityResult> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
    }
}