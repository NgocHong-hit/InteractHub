using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using InteractHub.API.Helpers;
using InteractHub.API.Models;
using InteractHub.API.Services;
using System.IO;
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
    public async Task<IActionResult> CreatePost([FromForm] CreatePostDto createPostDto)
    {
        if (string.IsNullOrWhiteSpace(createPostDto.Content))
            return BadRequest(new { message = "Content is required" });

        var userId = ClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized(new { message = "Invalid or missing user ID" });

        string? imageUrl = null;
        if (createPostDto.Image != null && createPostDto.Image.Length > 0)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(createPostDto.Image.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            try
            {
                await using var stream = new FileStream(filePath, FileMode.Create);
                await createPostDto.Image.CopyToAsync(stream);
                imageUrl = $"/uploads/{fileName}";
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to upload image: {ex.Message}" });
            }
        }

        var post = new Post
        {
            Content = createPostDto.Content,
            ImageUrl = imageUrl,
            UserId = userId.Value
        };

        try
        {
            var createdPost = await _postService.CreatePostAsync(post);
            var createdPostWithRelations = await _postService.GetPostByIdAsync(createdPost.Id);
            return CreatedAtAction(nameof(GetPostById), new { id = createdPost.Id }, createdPostWithRelations ?? createdPost);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Failed to create post: {ex.Message}" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePost(int id, [FromBody] UpdatePostDto updatePostDto)
    {
        var userId = ClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized(new { message = "Invalid or missing user ID" });

        var existingPost = await _postService.GetPostByIdAsync(id);
        if (existingPost == null)
            return NotFound();

        if (existingPost.UserId != userId.Value)
            return Forbid();

        existingPost.Content = updatePostDto.Content ?? existingPost.Content;
        existingPost.ImageUrl = updatePostDto.ImageUrl ?? existingPost.ImageUrl;

        var updatedPost = await _postService.UpdatePostAsync(existingPost);
        return Ok(updatedPost);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var userId = ClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized(new { message = "Invalid or missing user ID" });

        var existingPost = await _postService.GetPostByIdAsync(id);
        if (existingPost == null)
            return NotFound();

        if (existingPost.UserId != userId.Value)
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
    public IFormFile? Image { get; set; }
}

public class UpdatePostDto
{
    public string? Content { get; set; }
    public string? ImageUrl { get; set; }
}