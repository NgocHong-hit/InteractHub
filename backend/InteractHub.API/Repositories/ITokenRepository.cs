using InteractHub.API.Models;

namespace InteractHub.API.Repositories
{
    public interface ITokenRepository
    {
        string CreateToken(User user, IList<string> roles);
    }
}