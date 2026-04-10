using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using InteractHub.API.Models;

namespace InteractHub.API.Entities
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }           // Người nhận thông báo

        public int? SenderId { get; set; }        // Người gây ra thông báo (optional)

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;   // FriendRequest, FriendAccepted, Like, Comment, StoryNew...

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [ForeignKey("SenderId")]
        public User? Sender { get; set; }
    }
}