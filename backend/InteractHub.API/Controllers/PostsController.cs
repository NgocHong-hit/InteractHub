using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InteractHub.API.Models;
using InteractHub.API.Services;
using System.Security.Claims;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController : ControllerBase
{
    private readonly PostService _postService;

    public PostsController(PostService postService)
    {
        _postService = postService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPosts()
    {
        var posts = await _postService.GetAllPostsAsync();
        return Ok(posts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPostById(int id)
    {
        var post = await _postService.GetPostByIdAsync(id);
        if (post == null)
            return NotFound();

        return Ok(post);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetPostsByUserId(int userId)
    {
        var posts = await _postService.GetPostsByUserIdAsync(userId);
        return Ok(posts);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostDto createPostDto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var post = new Post
        {
            Content = createPostDto.Content,
            ImageUrl = createPostDto.ImageUrl,
            UserId = userId
        };

        var createdPost = await _postService.CreatePostAsync(post);
        return CreatedAtAction(nameof(GetPostById), new { id = createdPost.Id }, createdPost);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePost(int id, [FromBody] UpdatePostDto updatePostDto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var existingPost = await _postService.GetPostByIdAsync(id);
        if (existingPost == null)
            return NotFound();

        if (existingPost.UserId != userId)
            return Forbid();

        existingPost.Content = updatePostDto.Content ?? existingPost.Content;
        existingPost.ImageUrl = updatePostDto.ImageUrl ?? existingPost.ImageUrl;

        var updatedPost = await _postService.UpdatePostAsync(existingPost);
        return Ok(updatedPost);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var existingPost = await _postService.GetPostByIdAsync(id);
        if (existingPost == null)
            return NotFound();

        if (existingPost.UserId != userId)
            return Forbid();

        var result = await _postService.DeletePostAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}

public class CreatePostDto
{
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

public class UpdatePostDto
{
    public string? Content { get; set; }
    public string? ImageUrl { get; set; }
}