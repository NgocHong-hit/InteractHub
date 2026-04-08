using InteractHub.API.DTOs.Account;

namespace InteractHub.API.Interfaces
{
    public interface IAccountService
    {
        Task<object> RegisterAsync(RegisterDto registerDto);
        Task<object> LoginAsync(LoginDto loginDto);
    }
}