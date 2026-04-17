using InteractHub.API.Models;

namespace InteractHub.API.Repositories;

public interface IHashtagRepository
{
    Task<Hashtag?> GetByIdAsync(int id);
    Task<Hashtag?> GetByNameAsync(string name);
    Task<IEnumerable<Hashtag>> GetAllAsync();
    Task<IEnumerable<Hashtag>> GetTrendingAsync(int limit = 10);
    Task<Hashtag> CreateAsync(Hashtag hashtag);
    Task<Hashtag?> UpdateAsync(Hashtag hashtag);
    Task<bool> DeleteAsync(int id);
    Task<bool> IncrementUsageAsync(int id);
}
