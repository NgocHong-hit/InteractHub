// Repositories/FriendshipRepository.cs
using InteractHub.API.Data;
using InteractHub.API.Models;
using InteractHub.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Repositories
{
    public class FriendshipRepository : IFriendshipRepository
    {
        private readonly AppDbContext _context;

        public FriendshipRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Friendship?> GetByIdAsync(int id)
        {
            return await _context.Friendships
                .Include(f => f.User1)
                .Include(f => f.User2)
                .FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<Friendship?> GetFriendshipBetweenAsync(int userId1, int userId2)
        {
            return await _context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.UserId1 == userId1 && f.UserId2 == userId2) ||
                    (f.UserId1 == userId2 && f.UserId2 == userId1));
        }

        public async Task<IEnumerable<Friendship>> GetPendingRequestsAsync(int userId)
        {
            return await _context.Friendships
                .Include(f => f.User1)
                .Where(f => f.UserId2 == userId && f.Status == FriendshipStatus.Pending)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Friendship>> GetFriendsAsync(int userId)
        {
            return await _context.Friendships
                .Include(f => f.User1)
                .Include(f => f.User2)
                .Where(f => (f.UserId1 == userId || f.UserId2 == userId)
                         && f.Status == FriendshipStatus.Accepted)
                .ToListAsync();
        }

        public async Task<IEnumerable<Friendship>> GetSentRequestsAsync(int userId)
        {
            return await _context.Friendships
                .Include(f => f.User2)
                .Where(f => f.UserId1 == userId && f.Status == FriendshipStatus.Pending)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(Friendship friendship)
        {
            await _context.Friendships.AddAsync(friendship);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Friendship friendship)
        {
            _context.Friendships.Update(friendship);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Friendship friendship)
        {
            _context.Friendships.Remove(friendship);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int userId1, int userId2)
        {
            return await _context.Friendships.AnyAsync(f =>
                (f.UserId1 == userId1 && f.UserId2 == userId2) ||
                (f.UserId1 == userId2 && f.UserId2 == userId1));
        }
    }
}