using InteractHub.API.Models;
using InteractHub.API.Repositories;

namespace InteractHub.API.Services;

public class CommentService
{
    private readonly ICommentRepository _commentRepository;

    public CommentService(ICommentRepository commentRepository)
    {
        _commentRepository = commentRepository;
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
        return await _commentRepository.CreateAsync(comment);
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