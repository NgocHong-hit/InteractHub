using InteractHub.API.Models;
using InteractHub.API.Repositories;

namespace InteractHub.API.Services;

public class LikeService
{
    private readonly ILikeRepository _likeRepository;

    public LikeService(ILikeRepository likeRepository)
    {
        _likeRepository = likeRepository;
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
            return true;
        }
    }
}