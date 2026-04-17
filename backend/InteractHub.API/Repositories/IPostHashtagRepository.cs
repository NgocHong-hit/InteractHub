using InteractHub.API.Models;

namespace InteractHub.API.Repositories;

public interface IPostHashtagRepository
{
    Task<PostHashtag?> GetByIdAsync(int postId, int hashtagId);
    Task<IEnumerable<Hashtag>> GetHashtagsByPostIdAsync(int postId);
    Task<IEnumerable<Post>> GetPostsByHashtagIdAsync(int hashtagId, int skip = 0, int take = 20);
    Task<IEnumerable<Post>> GetPostsByHashtagNameAsync(string hashtagName, int skip = 0, int take = 20);
    Task<PostHashtag> CreateAsync(PostHashtag postHashtag);
    Task<bool> DeleteAsync(int postId, int hashtagId);
    Task<bool> DeleteAllByPostIdAsync(int postId);
}
