using InteractHub.API.Data;
using InteractHub.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories;

public class SharedPostRepository : ISharedPostRepository
{
    private readonly AppDbContext _context;

    public SharedPostRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SharedPost?> GetByIdAsync(int id)
    {
        return await _context.SharedPosts
            .Include(sp => sp.User)
            .Include(sp => sp.Post)
                .ThenInclude(p => p.User)
            .Include(sp => sp.Post)
                .ThenInclude(p => p.Comments).ThenInclude(c => c.User)
            .Include(sp => sp.Post)
                .ThenInclude(p => p.Likes).ThenInclude(l => l.User)
            .Include(sp => sp.Post)
                .ThenInclude(p => p.PostHashtags).ThenInclude(ph => ph.Hashtag)
            .FirstOrDefaultAsync(sp => sp.Id == id);
    }

    public async Task<IEnumerable<SharedPost>> GetAllAsync()
    {
        return await _context.SharedPosts
            .Include(sp => sp.User)
            .Include(sp => sp.Post)
                .ThenInclude(p => p.User)
            .Include(sp => sp.Post)
                .ThenInclude(p => p.Comments).ThenInclude(c => c.User)
            .Include(sp => sp.Post)
                .ThenInclude(p => p.Likes).ThenInclude(l => l.User)
            .Include(sp => sp.Post)
                .ThenInclude(p => p.PostHashtags).ThenInclude(ph => ph.Hashtag)
            .OrderByDescending(sp => sp.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<SharedPost>> GetByUserIdAsync(int userId)
    {
        return await _context.SharedPosts
            .Where(sp => sp.UserId == userId)
            .Include(sp => sp.User)
            .Include(sp => sp.Post)
                .ThenInclude(p => p.User)
            .Include(sp => sp.Post)
                .ThenInclude(p => p.Comments).ThenInclude(c => c.User)
            .Include(sp => sp.Post)
                .ThenInclude(p => p.Likes).ThenInclude(l => l.User)
            .Include(sp => sp.Post)
                .ThenInclude(p => p.PostHashtags).ThenInclude(ph => ph.Hashtag)
            .OrderByDescending(sp => sp.CreatedAt)
            .ToListAsync();
    }

    public async Task<SharedPost> CreateAsync(SharedPost sharedPost)
    {
        _context.SharedPosts.Add(sharedPost);
        await _context.SaveChangesAsync();
        return sharedPost;
    }

    public async Task<SharedPost> UpdateAsync(SharedPost sharedPost)
    {
        _context.SharedPosts.Update(sharedPost);
        await _context.SaveChangesAsync();
        return sharedPost;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var sharedPost = await _context.SharedPosts.FindAsync(id);
        if (sharedPost == null) return false;

        _context.SharedPosts.Remove(sharedPost);
        await _context.SaveChangesAsync();
        return true;
    }
}
