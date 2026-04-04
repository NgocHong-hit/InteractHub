using InteractHub.API.Data;
using InteractHub.API.Models;
using InteractHub.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories;

public class CommentRepository : ICommentRepository
{
    private readonly AppDbContext _context;

    public CommentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Comment?> GetByIdAsync(int id)
    {
        return await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Post)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Comment>> GetCommentsByPostIdAsync(int postId)
    {
        return await _context.Comments
            .Where(c => c.PostId == postId)
            .Include(c => c.User)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<Comment> CreateAsync(Comment comment)
    {
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();
        return comment;
    }

    public async Task<Comment?> UpdateAsync(Comment comment)
    {
        _context.Comments.Update(comment);
        await _context.SaveChangesAsync();
        return comment;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null) return false;

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        return true;
    }
}