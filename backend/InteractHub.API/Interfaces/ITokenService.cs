using InteractHub.API.Models;

namespace InteractHub.API.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(User user, IList<string> roles);
    }
}