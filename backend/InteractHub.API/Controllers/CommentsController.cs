using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InteractHub.API.Helpers;
using InteractHub.API.Models;
using InteractHub.API.Services;
using System.Security.Claims;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly CommentService _commentService;

    public CommentsController(CommentService commentService)
    {
        _commentService = commentService;
    }

    [AllowAnonymous]
    [HttpGet("post/{postId}")]
    public async Task<IActionResult> GetCommentsByPostId(int postId)
    {
        var comments = await _commentService.GetCommentsByPostIdAsync(postId);
        return Ok(comments);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCommentById(int id)
    {
        var comment = await _commentService.GetCommentByIdAsync(id);
        if (comment == null)
            return NotFound();

        return Ok(comment);
    }

    [HttpPost]
    public async Task<IActionResult> CreateComment([FromBody] CreateCommentDto createCommentDto)
    {
        var userId = ClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized(new { message = "Invalid or missing user ID" });

        if (string.IsNullOrWhiteSpace(createCommentDto.Content))
            return BadRequest(new { message = "Content is required" });

        var comment = new Comment
        {
            Content = createCommentDto.Content,
            PostId = createCommentDto.PostId,
            UserId = userId.Value
        };

        var createdComment = await _commentService.CreateCommentAsync(comment);
        var createdCommentWithUser = await _commentService.GetCommentByIdAsync(createdComment.Id);
        return CreatedAtAction(nameof(GetCommentById), new { id = createdComment.Id }, createdCommentWithUser);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentDto updateCommentDto)
    {
        var userId = ClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized(new { message = "Invalid or missing user ID" });

        var existingComment = await _commentService.GetCommentByIdAsync(id);
        if (existingComment == null)
            return NotFound();

        if (existingComment.UserId != userId.Value)
            return Forbid();

        existingComment.Content = updateCommentDto.Content ?? existingComment.Content;

        var updatedComment = await _commentService.UpdateCommentAsync(existingComment);
        return Ok(updatedComment);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var userId = ClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized(new { message = "Invalid or missing user ID" });

        var existingComment = await _commentService.GetCommentByIdAsync(id);
        if (existingComment == null)
            return NotFound();

        if (existingComment.UserId != userId.Value)
            return Forbid();

        var result = await _commentService.DeleteCommentAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}

public class CreateCommentDto
{
    public string Content { get; set; } = string.Empty;
    public int PostId { get; set; }
}

public class UpdateCommentDto
{
    public string? Content { get; set; }
}