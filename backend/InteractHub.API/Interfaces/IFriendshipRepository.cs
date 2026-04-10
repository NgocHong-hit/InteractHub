// Interfaces/IFriendshipRepository.cs
using InteractHub.API.Models;

namespace InteractHub.API.Interfaces
{
    public interface IFriendshipRepository
    {
        Task<Friendship?> GetByIdAsync(int id);
        Task<Friendship?> GetFriendshipBetweenAsync(int userId1, int userId2);
        Task<IEnumerable<Friendship>> GetPendingRequestsAsync(int userId);
        Task<IEnumerable<Friendship>> GetFriendsAsync(int userId);
        Task<IEnumerable<Friendship>> GetSentRequestsAsync(int userId);
        Task AddAsync(Friendship friendship);
        Task UpdateAsync(Friendship friendship);
        Task DeleteAsync(Friendship friendship);
        Task<bool> ExistsAsync(int userId1, int userId2);
    }
}