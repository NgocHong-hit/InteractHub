using InteractHub.API.Models;
using InteractHub.API.Repositories;

namespace InteractHub.API.Services;

public class PostService
{
    private readonly IPostRepository _postRepository;

    public PostService(IPostRepository postRepository)
    {
        _postRepository = postRepository;
    }

    public async Task<Post?> GetPostByIdAsync(int id)
    {
        return await _postRepository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<Post>> GetAllPostsAsync()
    {
        return await _postRepository.GetAllAsync();
    }

    public async Task<IEnumerable<Post>> GetPostsByUserIdAsync(int userId)
    {
        return await _postRepository.GetPostsByUserIdAsync(userId);
    }

    public async Task<Post> CreatePostAsync(Post post)
    {
        return await _postRepository.CreateAsync(post);
    }

    public async Task<Post?> UpdatePostAsync(Post post)
    {
        return await _postRepository.UpdateAsync(post);
    }

    public async Task<bool> DeletePostAsync(int id)
    {
        return await _postRepository.DeleteAsync(id);
    }
}