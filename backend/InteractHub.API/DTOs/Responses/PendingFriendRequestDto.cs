using System;

namespace InteractHub.API.DTOs.Responses
{
    public class PendingFriendRequestDto
    {
        public int FriendshipId { get; set; }

        // Người GỬI lời mời
        public int SenderId { get; set; }
        public string SenderUserName { get; set; } = string.Empty;
        public string SenderFullName { get; set; } = string.Empty;
        public string? SenderAvatarUrl { get; set; }

        // Người NHẬN lời mời (dùng cho tab "Đã gửi")
        public int ReceiverId { get; set; }
        public string ReceiverUserName { get; set; } = string.Empty;
        public string ReceiverFullName { get; set; } = string.Empty;
        public string? ReceiverAvatarUrl { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
