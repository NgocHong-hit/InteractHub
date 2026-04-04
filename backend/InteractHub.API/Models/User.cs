using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace InteractHub.API.Models
{
    public class User : IdentityUser<int> 
    {
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }        // Lưu "Male", "Female" hoặc "Other"
   
        // THÊM CÁC DÒNG DƯỚI ĐÂY ĐỂ HẾT LỖI CS1061
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<Like> Likes { get; set; } = new List<Like>();
        
        // Quan hệ bạn bè thường chia làm 2 phía: người gửi và người nhận
        public virtual ICollection<Friendship> Friendships1 { get; set; } = new List<Friendship>();
        public virtual ICollection<Friendship> Friendships2 { get; set; } = new List<Friendship>();
    }
}