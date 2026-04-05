using System;
using System.Text.Json.Serialization;

namespace InteractHub.API.Models
{
    public class Comment
    {
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int PostId { get; set; }
    [JsonIgnore]
    public virtual Post Post { get; set; } = null!;
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;
    }
}