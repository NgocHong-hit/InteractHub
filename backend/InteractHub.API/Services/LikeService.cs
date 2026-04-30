using InteractHub.API.Models;
using InteractHub.API.Repositories;
using InteractHub.API.Interfaces;

namespace InteractHub.API.Services;

public class LikeService
{
    private readonly ILikeRepository _likeRepository;
    private readonly IPostRepository _postRepository;
    private readonly INotificationService _notificationService;

    public LikeService(
        ILikeRepository likeRepository,
        IPostRepository postRepository,
        INotificationService notificationService)
    {
        _likeRepository = likeRepository;
        _postRepository = postRepository;
        _notificationService = notificationService;
    }

    public async Task<Like?> GetLikeByIdAsync(int id)
    {
        return await _likeRepository.GetByIdAsync(id);
    }

    public async Task<Like?> GetLikeByPostAndUserAsync(int postId, int userId)
    {
        return await _likeRepository.GetLikeByPostAndUserAsync(postId, userId);
    }

    public async Task<IEnumerable<Like>> GetLikesByPostIdAsync(int postId)
    {
        return await _likeRepository.GetLikesByPostIdAsync(postId);
    }

    public async Task<Like> CreateLikeAsync(Like like)
    {
        return await _likeRepository.CreateAsync(like);
    }

    public async Task<bool> DeleteLikeAsync(int id)
    {
        return await _likeRepository.DeleteAsync(id);
    }

    public async Task<bool> ToggleLikeAsync(int postId, int userId)
    {
        var existingLike = await _likeRepository.GetLikeByPostAndUserAsync(postId, userId);
        if (existingLike != null)
        {
            return await _likeRepository.DeleteAsync(existingLike.Id);
        }
        else
        {
            var newLike = new Like { PostId = postId, UserId = userId };
            await _likeRepository.CreateAsync(newLike);

            // Gửi thông báo cho chủ bài viết
            try
            {
                var post = await _postRepository.GetByIdAsync(postId);
                if (post != null)
                {
                    await _notificationService.CreateAndSendNotificationAsync(
                        post.UserId, userId, NotificationType.Like,
                        "đã thích bài viết của bạn.");
                }
            }
            catch { /* Không để lỗi notification phá vỡ luồng chính */ }

            return true;
        }
    }
}