// Interfaces/IFriendshipService.cs
using InteractHub.API.Helpers;
using InteractHub.API.DTOs.Responses;

namespace InteractHub.API.Interfaces
{
    public interface IFriendshipService
    {
        Task<ServiceResult> SendFriendRequestAsync(int senderId, int receiverId);
        Task<ServiceResult> AcceptFriendRequestAsync(int userId, int friendshipId);
        Task<ServiceResult> RejectFriendRequestAsync(int userId, int friendshipId);
        Task<ServiceResult> RemoveFriendAsync(int userId, int friendId);
        Task<List<FriendDto>> GetMyFriendsAsync(int userId);
        Task<List<PendingFriendRequestDto>> GetPendingReceivedRequestsAsync(int userId);
        Task<List<PendingFriendRequestDto>> GetSentRequestsAsync(int userId);
    }
}