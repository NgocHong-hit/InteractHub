using InteractHub.API.Models;

namespace InteractHub.API.Repositories;

public interface ISharedPostRepository
{
    Task<SharedPost?> GetByIdAsync(int id);
    Task<IEnumerable<SharedPost>> GetAllAsync();
    Task<IEnumerable<SharedPost>> GetByUserIdAsync(int userId);
    Task<SharedPost> CreateAsync(SharedPost sharedPost);
    Task<SharedPost> UpdateAsync(SharedPost sharedPost);
    Task<bool> DeleteAsync(int id);
}
