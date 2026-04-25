using InteractHub.API.Common;
using InteractHub.API.DTOs.Requests;
using InteractHub.API.DTOs.Responses;
using InteractHub.API.Models;
using InteractHub.API.Interfaces;
using InteractHub.API.Repositories;

namespace InteractHub.API.Services
{
    public class StoryService : IStoryService
    {
        private readonly IStoryRepository _storyRepository;
        private readonly IFriendshipRepository _friendshipRepository;

        public StoryService(
            IStoryRepository storyRepository,
            IFriendshipRepository friendshipRepository)
        {
            _storyRepository = storyRepository;
            _friendshipRepository = friendshipRepository;
        }

        // 1. Đăng Story mới
        public async Task<ServiceResult> CreateStoryAsync(int userId, CreateStoryDto dto)
        {
            var story = new Story
            {
                UserId = userId,
                Content = dto.Content,
                MediaUrl = dto.MediaUrl,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24) // Hết hạn sau 24h
            };

            await _storyRepository.AddAsync(story);
            return ServiceResult.Success("Đăng Story thành công");
        }

        // 2. Xóa Story
        public async Task<ServiceResult> DeleteStoryAsync(int userId, int storyId)
        {
            var story = await _storyRepository.GetByIdAsync(storyId);

            if (story == null)
                return ServiceResult.Failure("Không tìm thấy Story.");

            if (story.UserId != userId)
                return ServiceResult.Failure("Bạn không có quyền xóa Story này.");

            await _storyRepository.DeleteAsync(story);
            return ServiceResult.Success("Đã xóa Story thành công.");
        }

        // 3. Lấy TẤT CẢ Story đang hoạt động (Dành cho Explore hoặc Test)
        public async Task<List<StoryDto>> GetAllActiveStoriesAsync()
        {
            // Lưu ý: Đảm bảo Repository có hàm GetActiveStoriesAsync() 
            // hoặc dùng GetExpiredStoriesAsync nhưng phải lọc IsActive
            var stories = await _storyRepository.GetExpiredStoriesAsync();
            
            return stories
                .Where(s => s.IsActive)
                .Select(s => MapToDto(s))
                .ToList();
        }

        // 4. Quan trọng nhất: Lấy Story của bạn bè để hiện lên Feed
        public async Task<List<StoryDto>> GetFriendsStoriesAsync(int userId)
        {
            // 1. Lấy danh sách bạn bè từ Repository (Dùng hàm hiện có của bạn)
            var friendships = await _friendshipRepository.GetFriendsAsync(userId);
            
            var friendIds = friendships.Select(f =>
                f.UserId1 == userId ? f.UserId2 : f.UserId1).ToList();

            // 3. Thêm chính mình vào danh sách để xem được story của mình
            friendIds.Add(userId);

            // 4. Kiểm tra danh sách không trống
            if (friendIds.Count == 0) return new List<StoryDto>();

            // 5. Gọi Repository lấy story theo List ID
            var stories = await _storyRepository.GetActiveStoriesByUserIdsAsync(friendIds);
            
            // 6. Lọc và Map dữ liệu (Dùng dấu ? để tránh lỗi 500)
            return stories
                .Where(s => s.IsActive)
                .Select(s => new StoryDto
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    UserName = s.User?.UserName ?? "Người dùng",
                    FullName = s.User?.FullName ?? "Người dùng",
                    AvatarUrl = s.User?.AvatarUrl,
                    Content = s.Content,
                    MediaUrl = s.MediaUrl,
                    CreatedAt = s.CreatedAt,
                    ExpiresAt = s.ExpiresAt,
                    IsActive = s.IsActive
                }).ToList();
        }

        // 5. Lấy Story của riêng tôi
        public async Task<List<StoryDto>> GetMyActiveStoriesAsync(int userId)
        {
            var stories = await _storyRepository.GetUserActiveStoriesAsync(userId);

            return stories
                .Select(s => MapToDto(s))
                .ToList();
        }

        // --- Hàm phụ trợ để tránh lặp code (Helper Method) ---
        private static StoryDto MapToDto(Story s)
        {
            return new StoryDto
            {
                Id = s.Id,
                UserId = s.UserId,
                UserName = s.User?.UserName ?? "Người dùng", 
                FullName = s.User?.FullName ?? "Người dùng InteractHub",
                AvatarUrl = s.User?.AvatarUrl,
                Content = s.Content,
                MediaUrl = s.MediaUrl,
                CreatedAt = s.CreatedAt,
                ExpiresAt = s.ExpiresAt,
                IsActive = s.IsActive
            };
        }
    }
}