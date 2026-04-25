using InteractHub.API.Models;
using InteractHub.API.Repositories;
using InteractHub.API.Interfaces;
using InteractHub.API.Common;
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

        // 1. Gửi lời mời
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

            await _notificationService.CreateAndSendNotificationAsync(
                receiverId, senderId, NotificationType.FriendRequest, "Bạn có một lời mời kết bạn mới.");

            return ServiceResult.Success("Đã gửi lời mời kết bạn thành công.");
        }

        // 2. Chấp nhận
        public async Task<ServiceResult> AcceptFriendRequestAsync(int userId, int friendshipId)
        {
            var friendship = await _friendshipRepository.GetByIdAsync(friendshipId);
            if (friendship == null) return ServiceResult.Failure("Không tìm thấy lời mời.");
            if (friendship.UserId2 != userId) return ServiceResult.Failure("Lời mời này không thuộc về bạn.");

            friendship.Status = FriendshipStatus.Accepted;
            await _friendshipRepository.UpdateAsync(friendship);

            await _notificationService.CreateAndSendNotificationAsync(
                friendship.UserId1, userId, NotificationType.FriendAccepted, "Lời mời của bạn đã được chấp nhận.");

            return ServiceResult.Success("Đã chấp nhận lời mời thành công.");
        }

        // 3. Từ chối
        public async Task<ServiceResult> RejectFriendRequestAsync(int userId, int friendshipId)
        {
            var friendship = await _friendshipRepository.GetByIdAsync(friendshipId);
            if (friendship == null || friendship.UserId2 != userId)
                return ServiceResult.Failure("Lời mời không hợp lệ.");

            friendship.Status = FriendshipStatus.Rejected;
            await _friendshipRepository.UpdateAsync(friendship);
            return ServiceResult.Success("Đã từ chối lời mời.");
        }

        // 4. Xóa bạn
        public async Task<ServiceResult> RemoveFriendAsync(int userId, int friendId)
        {
            var friendship = await _friendshipRepository.GetFriendshipBetweenAsync(userId, friendId);
            if (friendship == null) return ServiceResult.Failure("Không tìm thấy mối quan hệ.");

            await _friendshipRepository.DeleteAsync(friendship);
            return ServiceResult.Success("Đã xóa thành công.");
        }

        // 5. Lấy danh sách bạn bè
        public async Task<List<FriendDto>> GetMyFriendsAsync(int userId)
        {
            var friendships = await _friendshipRepository.GetFriendsAsync(userId);
            return friendships.Select(f => {
                var friendUser = f.UserId1 == userId ? f.User2 : f.User1;
                return new FriendDto {
                    UserId = friendUser!.Id,
                    UserName = friendUser!.UserName ?? "",
                    FullName = friendUser!.FullName ?? friendUser!.UserName ?? "",
                    AvatarUrl = friendUser!.AvatarUrl
                };
            }).ToList();
        }

        // 6. Lấy lời mời NHẬN ĐƯỢC (Fix lỗi CS0535)
        public async Task<List<PendingFriendRequestDto>> GetPendingReceivedRequestsAsync(int userId)
        {
            var requests = await _friendshipRepository.GetPendingRequestsAsync(userId);
            return requests.Select(r => new PendingFriendRequestDto {
                FriendshipId = r.Id,
                SenderId = r.UserId1,
                SenderUserName = r.User1?.UserName ?? "",
                SenderFullName = r.User1?.FullName ?? r.User1?.UserName ?? "",
                SenderAvatarUrl = r.User1?.AvatarUrl,
                CreatedAt = r.CreatedAt
            }).ToList();
        }

        // 7. Lấy lời mời ĐÃ GỬI (Xóa bỏ phần trùng lặp lỗi CS0111)
        public async Task<List<PendingFriendRequestDto>> GetSentRequestsAsync(int userId)
        {
            var requests = await _friendshipRepository.GetSentRequestsAsync(userId);
            return requests.Select(r => new PendingFriendRequestDto {
                FriendshipId = r.Id,
                SenderId = r.UserId1, // Ở đây r.UserId1 chính là userId (người gửi)
                SenderUserName = r.User2?.UserName ?? "", // Hiển thị thông tin người mình gửi tới
                SenderFullName = r.User2?.FullName ?? r.User2?.UserName ?? "",
                SenderAvatarUrl = r.User2?.AvatarUrl,
                CreatedAt = r.CreatedAt
            }).ToList();
        }
    }
}