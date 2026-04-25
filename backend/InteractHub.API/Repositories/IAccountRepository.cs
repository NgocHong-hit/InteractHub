using InteractHub.API.DTOs.Account;

namespace InteractHub.API.Repositories
{
    public interface IAccountRepository
    {
        Task<object> RegisterAsync(RegisterDto registerDto);
        Task<object> LoginAsync(LoginDto loginDto);
    }
}