using InteractHub.API.Data;
using InteractHub.API.Models;
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
            => await _context.Friendships.FindAsync(id);

        public async Task<Friendship?> GetFriendshipBetweenAsync(int userId1, int userId2)
            => await _context.Friendships.FirstOrDefaultAsync(f => 
                (f.UserId1 == userId1 && f.UserId2 == userId2) || 
                (f.UserId1 == userId2 && f.UserId2 == userId1));

        public async Task<bool> ExistsAsync(int userId1, int userId2)
            => await _context.Friendships.AnyAsync(f => 
                (f.UserId1 == userId1 && f.UserId2 == userId2) || 
                (f.UserId1 == userId2 && f.UserId2 == userId1));

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


        // 1. Lấy danh sách LỜI MỜI NHẬN ĐƯỢC (Dành cho UserK)
        public async Task<List<Friendship>> GetPendingRequestsAsync(int userId)
        {
            // userId ở đây là ID của người đang đăng nhập (là 5 - nick userK)
            return await _context.Friendships
                .Include(f => f.User1) // Lấy thông tin người gửi (User 4)
                .Where(f => f.UserId2 == userId && f.Status == FriendshipStatus.Pending) 
                // Phải lọc theo UserId2 vì bạn là người NHẬN
                .ToListAsync();
        }
        // 2. Lấy danh sách LỜI MỜI ĐÃ GỬI (Dành cho UserC)
        public async Task<List<Friendship>> GetSentRequestsAsync(int userId)
        {
            return await _context.Friendships
                .Include(f => f.User2) // Lấy thông tin người nhận
                .Where(f => f.UserId1 == userId && f.Status == FriendshipStatus.Pending)
                .ToListAsync();
        }

        // 3. Lấy danh sách BẠN BÈ (Cả 2 bên đã đồng ý)
        public async Task<List<Friendship>> GetFriendsAsync(int userId)
        {
            return await _context.Friendships
                .Include(f => f.User1)
                .Include(f => f.User2)
                .Where(f => (f.UserId1 == userId || f.UserId2 == userId) && f.Status == FriendshipStatus.Accepted)
                .ToListAsync();
        }
    }
}