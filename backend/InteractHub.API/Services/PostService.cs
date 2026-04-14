using InteractHub.API.Models;
using InteractHub.API.Repositories;
using System.Text.RegularExpressions;

namespace InteractHub.API.Services;

public class PostService
{
    private readonly IPostRepository _postRepository;
    private readonly IPostHashtagRepository _postHashtagRepository;
    private readonly IHashtagRepository _hashtagRepository;

    public PostService(
        IPostRepository postRepository,
        IPostHashtagRepository postHashtagRepository,
        IHashtagRepository hashtagRepository)
    {
        _postRepository = postRepository;
        _postHashtagRepository = postHashtagRepository;
        _hashtagRepository = hashtagRepository;
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

    /// <summary>
    /// Extract hashtags from post content (e.g., "Hello #world #test")
    /// </summary>
    public List<string> ExtractHashtagsFromContent(string content)
    {
        var regex = new Regex(@"#[\w]+");
        var matches = regex.Matches(content);
        var hashtags = matches.Cast<Match>().Select(m => m.Value).Distinct().ToList();
        return hashtags;
    }

    /// <summary>
    /// Create post with automatic hashtag extraction and creation
    /// </summary>
    public async Task<Post> CreatePostWithHashtagsAsync(Post post)
    {
        // Save the post first
        var createdPost = await CreatePostAsync(post);

        // Extract hashtags from content
        var hashtags = ExtractHashtagsFromContent(post.Content);

        // Create/link hashtags
        foreach (var hashtagName in hashtags)
        {
            var hashtag = await _hashtagRepository.GetByNameAsync(hashtagName);
            
            if (hashtag == null)
            {
                hashtag = await _hashtagRepository.CreateAsync(new Hashtag
                {
                    Name = hashtagName
                });
            }

            // Link hashtag to post
            await _postHashtagRepository.CreateAsync(new PostHashtag
            {
                PostId = createdPost.Id,
                HashtagId = hashtag.Id
            });
        }

        return createdPost;
    }
}