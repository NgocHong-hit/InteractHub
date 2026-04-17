using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using InteractHub.API.Models;

namespace InteractHub.API.Entities
{
    public class Story
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        public string? Content { get; set; }           // Nội dung text

        public string? MediaUrl { get; set; }          // Đường dẫn ảnh/video

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime ExpiresAt { get; set; }        // Thời gian hết hạn (thường +24h)

        public bool IsActive => DateTime.UtcNow < ExpiresAt;

        // Navigation
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}