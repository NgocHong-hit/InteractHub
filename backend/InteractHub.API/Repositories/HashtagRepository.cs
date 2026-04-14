using InteractHub.API.Data;
using InteractHub.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories;

public class HashtagRepository : IHashtagRepository
{
    private readonly AppDbContext _context;

    public HashtagRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Hashtag?> GetByIdAsync(int id)
    {
        return await _context.Hashtags.FindAsync(id);
    }

    public async Task<Hashtag?> GetByNameAsync(string name)
    {
        return await _context.Hashtags
            .FirstOrDefaultAsync(h => h.Name.ToLower() == name.ToLower());
    }

    public async Task<IEnumerable<Hashtag>> GetAllAsync()
    {
        return await _context.Hashtags.ToListAsync();
    }

    public async Task<IEnumerable<Hashtag>> GetTrendingAsync(int limit = 10)
    {
        return await _context.Hashtags
            .Include(h => h.PostHashtags)
            .OrderByDescending(h => h.PostHashtags.Count)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<Hashtag> CreateAsync(Hashtag hashtag)
    {
        _context.Hashtags.Add(hashtag);
        await _context.SaveChangesAsync();
        return hashtag;
    }

    public async Task<Hashtag?> UpdateAsync(Hashtag hashtag)
    {
        _context.Hashtags.Update(hashtag);
        await _context.SaveChangesAsync();
        return hashtag;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var hashtag = await GetByIdAsync(id);
        if (hashtag == null)
            return false;

        _context.Hashtags.Remove(hashtag);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IncrementUsageAsync(int id)
    {
        var hashtag = await GetByIdAsync(id);
        if (hashtag == null)
            return false;

        hashtag.Name = hashtag.Name; // Update to refresh
        await _context.SaveChangesAsync();
        return true;
    }
}
