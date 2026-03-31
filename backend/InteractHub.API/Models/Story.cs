namespace InteractHub.API.Models;

public class Story
{
    public int Id { get; set; }
    public string? MediaUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);

    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;
}