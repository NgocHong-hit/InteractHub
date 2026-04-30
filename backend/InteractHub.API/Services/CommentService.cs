using InteractHub.API.Models;
using InteractHub.API.Repositories;
using InteractHub.API.Interfaces;

namespace InteractHub.API.Services;

public class CommentService
{
    private readonly ICommentRepository _commentRepository;
    private readonly IPostRepository _postRepository;
    private readonly INotificationService _notificationService;

    public CommentService(
        ICommentRepository commentRepository,
        IPostRepository postRepository,
        INotificationService notificationService)
    {
        _commentRepository = commentRepository;
        _postRepository = postRepository;
        _notificationService = notificationService;
    }

    public async Task<Comment?> GetCommentByIdAsync(int id)
    {
        return await _commentRepository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<Comment>> GetCommentsByPostIdAsync(int postId)
    {
        return await _commentRepository.GetCommentsByPostIdAsync(postId);
    }

    public async Task<Comment> CreateCommentAsync(Comment comment)
    {
        var created = await _commentRepository.CreateAsync(comment);

        // Gửi thông báo cho chủ bài viết
        try
        {
            var post = await _postRepository.GetByIdAsync(comment.PostId);
            if (post != null)
            {
                await _notificationService.CreateAndSendNotificationAsync(
                    post.UserId, comment.UserId, NotificationType.Comment,
                    "đã bình luận về bài viết của bạn.");
            }
        }
        catch { /* Không để lỗi notification phá vỡ luồng chính */ }

        return created;
    }

    public async Task<Comment?> UpdateCommentAsync(Comment comment)
    {
        return await _commentRepository.UpdateAsync(comment);
    }

    public async Task<bool> DeleteCommentAsync(int id)
    {
        return await _commentRepository.DeleteAsync(id);
    }
}