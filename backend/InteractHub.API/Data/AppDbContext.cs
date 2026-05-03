using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using InteractHub.API.Models;

namespace InteractHub.API.Data;

public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Post> Posts { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<Story> Stories { get; set; }
    public DbSet<Friendship> Friendships { get; set; }
    public DbSet<Hashtag> Hashtags { get; set; }
    public DbSet<PostHashtag> PostHashtags { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Report> Reports { get; set; }
    public DbSet<SharedPost> SharedPosts { get; set; }

   protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // 1. Giữ nguyên cấu hình cũ của bạn (Hashtag, Friendship...)
    modelBuilder.Entity<PostHashtag>()
        .HasKey(ph => new { ph.PostId, ph.HashtagId });

    // 2. KHẮC PHỤC LỖI 1785: Chuyển Cascade sang Restrict cho Comment và Like
    // Thay vì tự động xóa, chúng ta sẽ quản lý việc này bằng code hoặc xóa thủ công
    
    // Đối với Comment: Khi User bị xóa, KHÔNG tự động xóa Comment (để tránh xung đột đường dẫn)
    modelBuilder.Entity<Comment>()
        .HasOne(c => c.User)
        .WithMany(u => u.Comments)
        .HasForeignKey(c => c.UserId)
        .OnDelete(DeleteBehavior.Restrict); // Đổi từ Cascade sang Restrict

    // Đối với Like: Tương tự như Comment
    modelBuilder.Entity<Like>()
        .HasOne(l => l.User)
        .WithMany(u => u.Likes)
        .HasForeignKey(l => l.UserId)
        .OnDelete(DeleteBehavior.Restrict); // Đổi từ Cascade sang Restrict

    // 3. Cấu hình Friendship
    modelBuilder.Entity<Friendship>()
        .HasKey(f => f.Id);

    modelBuilder.Entity<Friendship>()
        .HasOne(f => f.User1)
        .WithMany(u => u.SentFriendRequests)
        .HasForeignKey(f => f.UserId1)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Friendship>()
        .HasOne(f => f.User2)
        .WithMany(u => u.ReceivedFriendRequests)
        .HasForeignKey(f => f.UserId2)
        .OnDelete(DeleteBehavior.Restrict);
    modelBuilder.Entity<Friendship>()
        .Property(f => f.Status)
        .HasConversion<string>();

    // 4. Cấu hình Notification — tránh lỗi cascade path
    modelBuilder.Entity<Notification>()
        .HasOne(n => n.User)
        .WithMany()
        .HasForeignKey(n => n.UserId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Notification>()
        .HasOne(n => n.Sender)
        .WithMany()
        .HasForeignKey(n => n.SenderId)
        .OnDelete(DeleteBehavior.Restrict);

    // 5. Cấu hình SharedPost — tránh lỗi cascade path
    modelBuilder.Entity<SharedPost>()
        .HasOne(sp => sp.User)
        .WithMany(u => u.SharedPosts)
        .HasForeignKey(sp => sp.UserId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<SharedPost>()
        .HasOne(sp => sp.Post)
        .WithMany(p => p.SharedPosts)
        .HasForeignKey(sp => sp.PostId)
        .OnDelete(DeleteBehavior.Restrict);
        
    // Tạo sẵn 2 quyền trong DB
   modelBuilder.Entity<IdentityRole<int>>().HasData(
        new IdentityRole<int> 
        { 
            Id = 1, 
            Name = "Admin", 
            NormalizedName = "ADMIN" 
        },
        new IdentityRole<int> 
        { 
            Id = 2, 
            Name = "User", 
            NormalizedName = "USER" 
        }
    );
}
}