using InteractHub.API.Models;

namespace InteractHub.API.Repositories;

public interface ICommentRepository
{
    Task<Comment?> GetByIdAsync(int id);
    Task<IEnumerable<Comment>> GetCommentsByPostIdAsync(int postId);
    Task<Comment> CreateAsync(Comment comment);
    Task<Comment?> UpdateAsync(Comment comment);
    Task<bool> DeleteAsync(int id);
}