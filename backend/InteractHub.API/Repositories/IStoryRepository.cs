using InteractHub.API.Models;

namespace InteractHub.API.Repositories;

public interface IStoryRepository
{
    Task<Story?> GetByIdAsync(int id);
    Task AddAsync(Story story);
    Task DeleteAsync(Story story);
    Task<List<Story>> GetActiveStoriesByUserIdsAsync(List<int> userIds);
    Task<List<Story>> GetUserActiveStoriesAsync(int userId);
    Task<List<Story>> GetExpiredStoriesAsync();
}