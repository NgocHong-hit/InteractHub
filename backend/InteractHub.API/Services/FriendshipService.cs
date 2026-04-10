// Services/FriendshipService.cs
using InteractHub.API.Models;
using InteractHub.API.Interfaces;
using InteractHub.API.Helpers;
using InteractHub.API.DTOs.Responses;

namespace InteractHub.API.Services
{
    public class FriendshipService : IFriendshipService
    {
        private readonly IFriendshipRepository _friendshipRepository;
        private readonly INotificationService _notificationService;

        public FriendshipService(
            IFriendshipRepository friendshipRepository,
            INotificationService notificationService)
        {
            _friendshipRepository = friendshipRepository;
            _notificationService = notificationService;
        }

        public async Task<ServiceResult> SendFriendRequestAsync(int senderId, int receiverId)
        {
            if (senderId == receiverId)
                return ServiceResult.Failure("Không thể gửi lời mời kết bạn cho chính mình.");

            if (await _friendshipRepository.ExistsAsync(senderId, receiverId))
                return ServiceResult.Failure("Mối quan hệ kết bạn đã tồn tại.");

            var friendship = new Friendship
            {
                UserId1 = senderId,
                UserId2 = receiverId,
                Status = FriendshipStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _friendshipRepository.AddAsync(friendship);

            // Gửi thông báo cho người nhận
            await _notificationService.CreateAndSendNotificationAsync(
                receiverId,
                senderId,
                NotificationType.FriendRequest,
                $"Bạn có một lời mời kết bạn mới.");

            return ServiceResult.Success("Đã gửi lời mời kết bạn thành công.");
        }

        public async Task<ServiceResult> AcceptFriendRequestAsync(int userId, int friendshipId)
        {
            var friendship = await _friendshipRepository.GetByIdAsync(friendshipId);

            if (friendship == null)
                return ServiceResult.Failure("Không tìm thấy lời mời kết bạn.");

            if (friendship.UserId2 != userId)
                return ServiceResult.Failure("Lời mời này không thuộc về bạn.");

            if (friendship.Status != FriendshipStatus.Pending)
                return ServiceResult.Failure("Lời mời này không còn ở trạng thái chờ xử lý.");

            friendship.Status = FriendshipStatus.Accepted;
            await _friendshipRepository.UpdateAsync(friendship);

            // Gửi thông báo cho người gửi lời mời
            await _notificationService.CreateAndSendNotificationAsync(
                friendship.UserId1,
                userId,
                NotificationType.FriendAccepted,
                "Lời mời kết bạn của bạn đã được chấp nhận.");

            return ServiceResult.Success("Đã chấp nhận lời mời kết bạn thành công.");
        }

        public async Task<ServiceResult> RejectFriendRequestAsync(int userId, int friendshipId)
        {
            var friendship = await _friendshipRepository.GetByIdAsync(friendshipId);

            if (friendship == null || friendship.UserId2 != userId)
                return ServiceResult.Failure("Lời mời không hợp lệ.");

            friendship.Status = FriendshipStatus.Rejected;
            await _friendshipRepository.UpdateAsync(friendship);

            return ServiceResult.Success("Đã từ chối lời mời kết bạn.");
        }

        public async Task<ServiceResult> RemoveFriendAsync(int userId, int friendId)
        {
            var friendship = await _friendshipRepository.GetFriendshipBetweenAsync(userId, friendId);

            if (friendship == null || friendship.Status != FriendshipStatus.Accepted)
                return ServiceResult.Failure("Không tìm thấy mối quan hệ bạn bè.");

            await _friendshipRepository.DeleteAsync(friendship);

            return ServiceResult.Success("Đã xóa bạn bè thành công.");
        }

        public async Task<List<FriendDto>> GetMyFriendsAsync(int userId)
        {
            var friendships = await _friendshipRepository.GetFriendsAsync(userId);

            var friends = friendships.Select(f =>
            {
                var friendUser = f.UserId1 == userId ? f.User2 : f.User1;
                return new FriendDto
                {
                    UserId = friendUser.Id,
                    UserName = friendUser.UserName ?? string.Empty,
                    FullName = friendUser.FullName ?? friendUser.UserName ?? string.Empty,
                    AvatarUrl = friendUser.AvatarUrl
                };
            }).ToList();

            return friends;
        }

        public async Task<List<PendingFriendRequestDto>> GetPendingReceivedRequestsAsync(int userId)
        {
            var requests = await _friendshipRepository.GetPendingRequestsAsync(userId);

            return requests.Select(r => new PendingFriendRequestDto
            {
                FriendshipId = r.Id,
                SenderId = r.UserId1,
                SenderUserName = r.User1?.UserName ?? string.Empty,
                SenderFullName = r.User1?.FullName ?? r.User1?.UserName ?? string.Empty,
                SenderAvatarUrl = r.User1?.AvatarUrl,
                CreatedAt = r.CreatedAt
            }).ToList();
        }

        public async Task<List<PendingFriendRequestDto>> GetSentRequestsAsync(int userId)
        {
            var requests = await _friendshipRepository.GetSentRequestsAsync(userId);

            return requests.Select(r => new PendingFriendRequestDto
            {
                FriendshipId = r.Id,
                SenderId = r.UserId1,
                SenderUserName = r.User1?.UserName ?? string.Empty,
                SenderFullName = r.User1?.FullName ?? r.User1?.UserName ?? string.Empty,
                SenderAvatarUrl = r.User1?.AvatarUrl,
                CreatedAt = r.CreatedAt
            }).ToList();
        }
    }
}