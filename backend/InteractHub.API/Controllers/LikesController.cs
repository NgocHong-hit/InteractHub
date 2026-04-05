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
public class LikesController : ControllerBase
{
    private readonly LikeService _likeService;

    public LikesController(LikeService likeService)
    {
        _likeService = likeService;
    }

    [HttpGet("post/{postId}")]
    public async Task<IActionResult> GetLikesByPostId(int postId)
    {
        var likes = await _likeService.GetLikesByPostIdAsync(postId);
        return Ok(likes);
    }

    [HttpPost("toggle")]
    public async Task<IActionResult> ToggleLike([FromBody] ToggleLikeDto toggleLikeDto)
    {
        var userId = ClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized(new { message = "Invalid or missing user ID" });

        try
        {
            var result = await _likeService.ToggleLikeAsync(toggleLikeDto.PostId, userId.Value);
            return Ok(new { message = "Like toggled successfully", success = true });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Failed to toggle like: {ex.Message}", success = false });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLike(int id)
    {
        var userId = ClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized(new { message = "Invalid or missing user ID" });

        var existingLike = await _likeService.GetLikeByIdAsync(id);
        if (existingLike == null)
            return NotFound();

        if (existingLike.UserId != userId)
            return Forbid();

        var result = await _likeService.DeleteLikeAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}

public class ToggleLikeDto
{
    public int PostId { get; set; }
}