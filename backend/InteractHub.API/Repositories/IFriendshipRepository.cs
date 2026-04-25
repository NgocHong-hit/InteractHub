using InteractHub.API.Models;

namespace InteractHub.API.Repositories;

public interface IFriendshipRepository
{
    Task<Friendship?> GetByIdAsync(int id);
    Task<Friendship?> GetFriendshipBetweenAsync(int userId1, int userId2);
    Task<bool> ExistsAsync(int userId1, int userId2);
    Task AddAsync(Friendship friendship);
    Task UpdateAsync(Friendship friendship);
    Task DeleteAsync(Friendship friendship);
    Task<List<Friendship>> GetFriendsAsync(int userId);
    Task<List<Friendship>> GetPendingRequestsAsync(int userId);
    Task<List<Friendship>> GetSentRequestsAsync(int userId);
    
}
