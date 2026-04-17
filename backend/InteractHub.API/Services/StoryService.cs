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
        private readonly INotificationService _notificationService;

        public StoryService(
            IStoryRepository storyRepository,
            IFriendshipRepository friendshipRepository,
            INotificationService notificationService)
        {
            _storyRepository = storyRepository;
            _friendshipRepository = friendshipRepository;
            _notificationService = notificationService;
        }

        public async Task<ServiceResult> CreateStoryAsync(int userId, CreateStoryDto dto)
        {
            var story = new Story
            {
                UserId = userId,
                Content = dto.Content,
                MediaUrl = dto.MediaUrl,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24)   // Story hết hạn sau 24 giờ
            };

            await _storyRepository.AddAsync(story);

            // Gửi thông báo cho bạn bè (optional)
            // await NotifyFriendsAboutNewStory(userId);

            return ServiceResult.Success("Đăng Story thành công");
        }

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

        public async Task<List<StoryDto>> GetFriendsStoriesAsync(int userId)
        {
            // Lấy danh sách bạn bè
            var friendships = await _friendshipRepository.GetFriendsAsync(userId);
            var friendIds = friendships.Select(f =>
                f.UserId1 == userId ? f.UserId2 : f.UserId1).ToList();

            var stories = await _storyRepository.GetActiveStoriesByUserIdsAsync(friendIds);

            return stories.Select(s => new StoryDto
            {
                Id = s.Id,
                UserId = s.UserId,
                UserName = s.User.UserName ?? "",
                FullName = s.User.FullName,
                AvatarUrl = s.User.AvatarUrl,
                Content = s.Content,
                MediaUrl = s.MediaUrl,
                CreatedAt = s.CreatedAt,
                ExpiresAt = s.ExpiresAt,
                IsActive = s.IsActive
            }).ToList();
        }

        public async Task<List<StoryDto>> GetMyActiveStoriesAsync(int userId)
        {
            var stories = await _storyRepository.GetUserActiveStoriesAsync(userId);

            return stories.Select(s => new StoryDto
            {
                Id = s.Id,
                UserId = s.UserId,
                UserName = s.User.UserName ?? "",
                FullName = s.User.FullName,
                AvatarUrl = s.User.AvatarUrl,
                Content = s.Content,
                MediaUrl = s.MediaUrl,
                CreatedAt = s.CreatedAt,
                ExpiresAt = s.ExpiresAt,
                IsActive = s.IsActive
            }).ToList();
        }
    }
}
