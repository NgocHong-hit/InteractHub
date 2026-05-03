using System.Text.Json.Serialization;

namespace InteractHub.API.Models;

public class SharedPost
{
    public int Id { get; set; }

    // Người chia sẻ
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;

    // Bài viết gốc được chia sẻ
    public int PostId { get; set; }
    public virtual Post Post { get; set; } = null!;

    // Lời bình kèm khi chia sẻ (tùy chọn)
    public string? Content { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
