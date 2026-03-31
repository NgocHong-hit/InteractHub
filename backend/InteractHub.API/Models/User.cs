using Microsoft.AspNetCore.Identity;

namespace InteractHub.API.Models;

public class User : IdentityUser<int>
{
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    public virtual ICollection<Story> Stories { get; set; } = new List<Story>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Like> Likes { get; set; } = new List<Like>();
    public virtual ICollection<Friendship> Friendships1 { get; set; } = new List<Friendship>();
    public virtual ICollection<Friendship> Friendships2 { get; set; } = new List<Friendship>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}