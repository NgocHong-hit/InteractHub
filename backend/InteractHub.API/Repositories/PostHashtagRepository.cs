using InteractHub.API.Data;
using InteractHub.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories;

public class PostHashtagRepository : IPostHashtagRepository
{
    private readonly AppDbContext _context;

    public PostHashtagRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PostHashtag?> GetByIdAsync(int postId, int hashtagId)
    {
        return await _context.PostHashtags
            .FirstOrDefaultAsync(ph => ph.PostId == postId && ph.HashtagId == hashtagId);
    }

    public async Task<IEnumerable<Hashtag>> GetHashtagsByPostIdAsync(int postId)
    {
        return await _context.PostHashtags
            .Where(ph => ph.PostId == postId)
            .Include(ph => ph.Hashtag)
            .Select(ph => ph.Hashtag)
            .ToListAsync();
    }

    public async Task<IEnumerable<Post>> GetPostsByHashtagIdAsync(int hashtagId, int skip = 0, int take = 20)
    {
        return await _context.PostHashtags
            .Where(ph => ph.HashtagId == hashtagId)
            .Include(ph => ph.Post)
            .ThenInclude(p => p.User)
            .Include(ph => ph.Post)
            .ThenInclude(p => p.Comments)
            .Include(ph => ph.Post)
            .ThenInclude(p => p.Likes)
            .Skip(skip)
            .Take(take)
            .Select(ph => ph.Post)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Post>> GetPostsByHashtagNameAsync(string hashtagName, int skip = 0, int take = 20)
    {
        return await _context.PostHashtags
            .Where(ph => ph.Hashtag.Name.ToLower() == hashtagName.ToLower())
            .Include(ph => ph.Post)
            .ThenInclude(p => p.User)
            .Include(ph => ph.Post)
            .ThenInclude(p => p.Comments)
            .Include(ph => ph.Post)
            .ThenInclude(p => p.Likes)
            .Skip(skip)
            .Take(take)
            .Select(ph => ph.Post)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<PostHashtag> CreateAsync(PostHashtag postHashtag)
    {
        _context.PostHashtags.Add(postHashtag);
        await _context.SaveChangesAsync();
        return postHashtag;
    }

    public async Task<bool> DeleteAsync(int postId, int hashtagId)
    {
        var postHashtag = await GetByIdAsync(postId, hashtagId);
        if (postHashtag == null)
            return false;

        _context.PostHashtags.Remove(postHashtag);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAllByPostIdAsync(int postId)
    {
        var postHashtags = await _context.PostHashtags
            .Where(ph => ph.PostId == postId)
            .ToListAsync();

        _context.PostHashtags.RemoveRange(postHashtags);
        await _context.SaveChangesAsync();
        return true;
    }
}
