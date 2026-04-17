using Microsoft.EntityFrameworkCore;
using InteractHub.API.Data;
using InteractHub.API.Models;

namespace InteractHub.API.Services;

public class AdminService
{
    private readonly AppDbContext _context;

    public AdminService(AppDbContext context)
    {
        _context = context;
    }

    // ============ STATISTICS ============
    public async Task<object> GetStatistics()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalPosts = await _context.Posts.CountAsync();
        var totalComments = await _context.Comments.CountAsync();
        var pendingReports = await _context.Reports.CountAsync(r => r.Status == "Pending");

        return new
        {
            totalUsers,
            totalPosts,
            totalComments,
            pendingReports,
            timestamp = DateTime.UtcNow
        };
    }

    // ============ USER MANAGEMENT ============
    public async Task<object> GetAllUsers(int page = 1, int pageSize = 20)
    {
        var skip = (page - 1) * pageSize;
        var users = await _context.Users
            .Skip(skip)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email,
                u.FullName,
                u.CreatedAt,
                PostCount = u.Posts.Count,
                IsActive = u.LockoutEnd == null || u.LockoutEnd <= DateTime.UtcNow
            })
            .ToListAsync();

        var totalUsers = await _context.Users.CountAsync();

        return new
        {
            users,
            totalUsers,
            totalPages = (totalUsers + pageSize - 1) / pageSize,
            currentPage = page
        };
    }

    public async Task<object?> GetUserDetails(int id)
    {
        var user = await _context.Users
            .Include(u => u.Posts)
            .Include(u => u.Comments)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return null;

        return new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.FullName,
            user.Bio,
            user.AvatarUrl,
            user.CreatedAt,
            PostCount = user.Posts.Count,
            CommentCount = user.Comments.Count,
            IsActive = user.LockoutEnd == null || user.LockoutEnd <= DateTime.UtcNow,
            IsLocked = user.LockoutEnd > DateTime.UtcNow
        };
    }

    public async Task<bool> BlockUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return false;

        user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100); // Lock indefinitely
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnblockUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return false;

        user.LockoutEnd = null;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Posts)
            .Include(u => u.Comments)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return false;

        // Delete all related data
        _context.Comments.RemoveRange(user.Comments);
        _context.Posts.RemoveRange(user.Posts);
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return true;
    }

    // ============ REPORT MANAGEMENT ============
    public async Task<object> GetReports(string? status = null, int page = 1, int pageSize = 20)
    {
        var skip = (page - 1) * pageSize;
        
        var query = _context.Reports
            .Include(r => r.Post)
            .Include(r => r.Reporter)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(r => r.Status == status);

        var reports = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .Select(r => new
            {
                r.Id,
                r.Reason,
                r.Status,
                r.CreatedAt,
                PostId = r.Post!.Id,
                PostContent = r.Post!.Content.Substring(0, Math.Min(100, r.Post!.Content.Length)),
                PostAuthor = r.Post!.User.UserName,
                ReporterId = r.Reporter.Id,
                ReporterName = r.Reporter.UserName
            })
            .ToListAsync();

        var totalReports = await query.CountAsync();

        return new
        {
            reports,
            totalReports,
            totalPages = (totalReports + pageSize - 1) / pageSize,
            currentPage = page
        };
    }

    public async Task<bool> ApproveReport(int id)
    {
        var report = await _context.Reports
            .Include(r => r.Post)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report == null)
            return false;

        // Delete the reported post
        if (report.Post != null)
        {
            _context.Posts.Remove(report.Post);
        }

        report.Status = "Resolved";
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RejectReport(int id)
    {
        var report = await _context.Reports.FindAsync(id);
        if (report == null)
            return false;

        report.Status = "Rejected";
        await _context.SaveChangesAsync();

        return true;
    }

    // ============ CONTENT MODERATION ============
    public async Task<bool> DeletePost(int id)
    {
        var post = await _context.Posts.FindAsync(id);
        if (post == null)
            return false;

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteComment(int id)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
            return false;

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<object> GetAllPosts(int page = 1, int pageSize = 20)
    {
        var skip = (page - 1) * pageSize;
        var posts = await _context.Posts
            .Include(p => p.User)
            .Skip(skip)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                p.Content,
                Author = p.User.UserName,
                p.CreatedAt,
                CommentCount = p.Comments.Count,
                LikeCount = p.Likes.Count
            })
            .ToListAsync();

        var totalPosts = await _context.Posts.CountAsync();

        return new
        {
            posts,
            totalPosts,
            totalPages = (totalPosts + pageSize - 1) / pageSize,
            currentPage = page
        };
    }

    // ============ ACTIVITY LOGS ============
    public async Task<object> GetActivityLogs(int page = 1, int pageSize = 20)
    {
        var skip = (page - 1) * pageSize;
        
        // Gather recent activity from different sources
        var userLogins = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .Select(u => new
            {
                Id = u.Id.ToString(),
                Type = "User Created",
                Description = $"User {u.UserName} joined",
                Timestamp = u.CreatedAt,
                UserId = u.Id
            })
            .ToListAsync();

        var recentPosts = await _context.Posts
            .OrderByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .Select(p => new
            {
                Id = p.Id.ToString(),
                Type = "Post Created",
                Description = $"User {p.User.UserName} posted",
                Timestamp = p.CreatedAt,
                UserId = p.UserId
            })
            .ToListAsync();

        var allActivity = userLogins.Concat(recentPosts)
            .OrderByDescending(x => x.Timestamp)
            .Take(pageSize)
            .ToList();

        return new
        {
            activities = allActivity,
            totalActivities = allActivity.Count,
            currentPage = page
        };
    }
}
