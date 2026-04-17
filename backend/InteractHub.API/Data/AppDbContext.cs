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

    // 3. Cấu hình Friendship (Bạn đã làm, hãy giữ nguyên)
    modelBuilder.Entity<Friendship>()
        .HasOne(f => f.User1)
        .WithMany(u => u.Friendships1)
        .HasForeignKey(f => f.UserId1)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Friendship>()
        .HasOne(f => f.User2)
        .WithMany(u => u.Friendships2)
        .HasForeignKey(f => f.UserId2)
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