using InteractHub.API.Data;
using InteractHub.API.Models;
using InteractHub.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories;

public class LikeRepository : ILikeRepository
{
    private readonly AppDbContext _context;

    public LikeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Like?> GetByIdAsync(int id)
    {
        return await _context.Likes
            .Include(l => l.User)
            .Include(l => l.Post)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<Like?> GetLikeByPostAndUserAsync(int postId, int userId)
    {
        return await _context.Likes
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);
    }

    public async Task<IEnumerable<Like>> GetLikesByPostIdAsync(int postId)
    {
        return await _context.Likes
            .Where(l => l.PostId == postId)
            .Include(l => l.User)
            .ToListAsync();
    }

    public async Task<Like> CreateAsync(Like like)
    {
        _context.Likes.Add(like);
        await _context.SaveChangesAsync();
        return like;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var like = await _context.Likes.FindAsync(id);
        if (like == null) return false;

        _context.Likes.Remove(like);
        await _context.SaveChangesAsync();
        return true;
    }
}