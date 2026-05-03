using InteractHub.API.Models;
using InteractHub.API.Repositories;
using InteractHub.API.Interfaces;

namespace InteractHub.API.Services;

public class SharedPostService
{
    private readonly ISharedPostRepository _sharedPostRepository;
    private readonly IPostRepository _postRepository;
    private readonly INotificationService _notificationService;

    public SharedPostService(
        ISharedPostRepository sharedPostRepository,
        IPostRepository postRepository,
        INotificationService notificationService)
    {
        _sharedPostRepository = sharedPostRepository;
        _postRepository = postRepository;
        _notificationService = notificationService;
    }

    public async Task<SharedPost?> GetByIdAsync(int id)
    {
        return await _sharedPostRepository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<SharedPost>> GetAllSharedPostsAsync()
    {
        return await _sharedPostRepository.GetAllAsync();
    }

    public async Task<IEnumerable<SharedPost>> GetSharedPostsByUserIdAsync(int userId)
    {
        return await _sharedPostRepository.GetByUserIdAsync(userId);
    }

    public async Task<SharedPost> SharePostAsync(int postId, int userId, string? content)
    {
        // Kiểm tra bài viết gốc có tồn tại không
        var originalPost = await _postRepository.GetByIdAsync(postId);
        if (originalPost == null)
            throw new Exception("Bài viết không tồn tại.");

        var sharedPost = new SharedPost
        {
            PostId = postId,
            UserId = userId,
            Content = content
        };

        var created = await _sharedPostRepository.CreateAsync(sharedPost);

        // Gửi thông báo cho chủ bài viết gốc
        try
        {
            if (originalPost.UserId != userId) // Không thông báo nếu tự chia sẻ bài mình
            {
                await _notificationService.CreateAndSendNotificationAsync(
                    originalPost.UserId, userId, NotificationType.Like,
                    "đã chia sẻ bài viết của bạn.");
            }
        }
        catch { /* Không để lỗi notification phá vỡ luồng chính */ }

        // Trả về shared post đầy đủ relationships
        return await _sharedPostRepository.GetByIdAsync(created.Id) ?? created;
    }

    public async Task<SharedPost> UpdateSharedPostAsync(int id, int userId, string? newContent)
    {
        var sharedPost = await _sharedPostRepository.GetByIdAsync(id);
        if (sharedPost == null)
            throw new Exception("Bài chia sẻ không tồn tại.");

        if (sharedPost.UserId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa bài chia sẻ này.");

        sharedPost.Content = newContent;
        await _sharedPostRepository.UpdateAsync(sharedPost);
        
        return sharedPost;
    }

    public async Task<bool> DeleteSharedPostAsync(int id, int userId)
    {
        var sharedPost = await _sharedPostRepository.GetByIdAsync(id);
        if (sharedPost == null)
            return false;

        // Chỉ người chia sẻ mới được xóa
        if (sharedPost.UserId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa bài chia sẻ này.");

        return await _sharedPostRepository.DeleteAsync(id);
    }
}
