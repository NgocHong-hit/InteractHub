using InteractHub.API.Models;

namespace InteractHub.API.Repositories;

public interface ILikeRepository
{
    Task<Like?> GetByIdAsync(int id);
    Task<Like?> GetLikeByPostAndUserAsync(int postId, int userId);
    Task<IEnumerable<Like>> GetLikesByPostIdAsync(int postId);
    Task<Like> CreateAsync(Like like);
    Task<bool> DeleteAsync(int id);
}