using System;
using System.Text.Json.Serialization;

namespace InteractHub.API.Models
{
    public class Like
    {
    public int Id { get; set; }
    public int PostId { get; set; }
    [JsonIgnore]
    public virtual Post Post { get; set; } = null!;
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}