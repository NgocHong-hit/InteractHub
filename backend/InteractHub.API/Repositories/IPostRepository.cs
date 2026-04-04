using InteractHub.API.Models;

namespace InteractHub.API.Repositories;

public interface IPostRepository
{
    Task<Post?> GetByIdAsync(int id);
    Task<IEnumerable<Post>> GetAllAsync();
    Task<IEnumerable<Post>> GetPostsByUserIdAsync(int userId);
    Task<Post> CreateAsync(Post post);
    Task<Post?> UpdateAsync(Post post);
    Task<bool> DeleteAsync(int id);
}