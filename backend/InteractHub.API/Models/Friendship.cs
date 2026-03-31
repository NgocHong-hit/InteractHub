using System;

namespace InteractHub.API.Models
{
    public class Friendship
    {
    public int Id { get; set; }
    public int UserId1 { get; set; }
    public virtual User User1 { get; set; } = null!;
    public int UserId2 { get; set; }
    public virtual User User2 { get; set; } = null!;

    public string Status { get; set; } = "Pending"; // Pending, Accepted, Blocked
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}