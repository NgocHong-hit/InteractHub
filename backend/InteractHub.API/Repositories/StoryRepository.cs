using InteractHub.API.Data;
using InteractHub.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories
{
    public class StoryRepository : IStoryRepository
    {
        private readonly AppDbContext _context;

        public StoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Story?> GetByIdAsync(int id)
        {
            return await _context.Stories
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task AddAsync(Story story)
        {
            await _context.Stories.AddAsync(story);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Story story)
        {
            _context.Stories.Remove(story);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Story>> GetActiveStoriesByUserIdsAsync(List<int> userIds)
        {
            return await _context.Stories
                .Include(s => s.User)
                .Where(s => userIds.Contains(s.UserId) && s.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Story>> GetUserActiveStoriesAsync(int userId)
        {
            return await _context.Stories
                .Include(s => s.User)
                .Where(s => s.UserId == userId && s.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Story>> GetExpiredStoriesAsync()
        {
            return await _context.Stories
                .Where(s => s.ExpiresAt <= DateTime.UtcNow)
                .ToListAsync();
        }
    }
}