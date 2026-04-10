using System;

namespace InteractHub.API.DTOs.Responses
{
    public class PendingFriendRequestDto
    {
        public int FriendshipId { get; set; }
        public int SenderId { get; set; }
        public string SenderUserName { get; set; } = string.Empty;
        public string SenderFullName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? SenderAvatarUrl { get; set; }
    }
}
