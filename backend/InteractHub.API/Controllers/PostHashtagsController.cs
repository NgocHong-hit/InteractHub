using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InteractHub.API.Models;
using InteractHub.API.Repositories;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/post-hashtags")]
[AllowAnonymous]
public class PostHashtagsController : ControllerBase
{
    private readonly IPostHashtagRepository _postHashtagRepository;
    private readonly IHashtagRepository _hashtagRepository;

    public PostHashtagsController(
        IPostHashtagRepository postHashtagRepository,
        IHashtagRepository hashtagRepository)
    {
        _postHashtagRepository = postHashtagRepository;
        _hashtagRepository = hashtagRepository;
    }

    [HttpGet("post/{postId}")]
    public async Task<IActionResult> GetHashtagsByPostId(int postId)
    {
        var hashtags = await _postHashtagRepository.GetHashtagsByPostIdAsync(postId);
        return Ok(hashtags);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchPostsByHashtag([FromQuery] string name, [FromQuery] int skip = 0, [FromQuery] int take = 20)
    {
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest(new { message = "Hashtag name is required" });

        var posts = await _postHashtagRepository.GetPostsByHashtagNameAsync(name, skip, take);
        return Ok(posts);
    }

    [HttpPost("post/{postId}/by-name")]
    [Authorize]
    public async Task<IActionResult> AddHashtagByName(int postId, [FromBody] AddHashtagDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Hashtag name is required" });

        // Get or create hashtag
        var hashtag = await _hashtagRepository.GetByNameAsync(dto.Name);
        if (hashtag == null)
        {
            hashtag = await _hashtagRepository.CreateAsync(new Hashtag { Name = dto.Name });
        }

        // Add to post
        var postHashtag = new PostHashtag { PostId = postId, HashtagId = hashtag.Id };
        var created = await _postHashtagRepository.CreateAsync(postHashtag);
        return Ok(created);
    }

    [HttpDelete("post/{postId}/hashtag/{hashtagId}")]
    [Authorize]
    public async Task<IActionResult> RemoveHashtag(int postId, int hashtagId)
    {
        var success = await _postHashtagRepository.DeleteAsync(postId, hashtagId);
        if (!success)
            return NotFound(new { message = "Post-Hashtag relationship not found" });

        return Ok(new { message = "Hashtag removed from post" });
    }
}

public class AddHashtagDto
{
    public string Name { get; set; } = string.Empty;
}
