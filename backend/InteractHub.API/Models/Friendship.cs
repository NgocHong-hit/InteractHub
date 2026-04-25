using System;

namespace InteractHub.API.Models
{
    public enum FriendshipStatus { 
        Pending = 0,   // Đảm bảo cái này bằng 0
        Accepted = 1,
        Rejected = 2
     }

    public class Friendship
    {
        internal int RequestorId;

        public int Id { get; set; }
        public int UserId1 { get; set; } // Người gửi lời mời
        public virtual User? User1 { get; set; }

        public int UserId2 { get; set; } // Người nhận lời mời
        public virtual User? User2 { get; set; }

        public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
