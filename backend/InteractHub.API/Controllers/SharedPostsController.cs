using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InteractHub.API.Helpers;
using InteractHub.API.Services;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SharedPostsController : ControllerBase
{
    private readonly SharedPostService _sharedPostService;

    public SharedPostsController(SharedPostService sharedPostService)
    {
        _sharedPostService = sharedPostService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAllSharedPosts()
    {
        var sharedPosts = await _sharedPostService.GetAllSharedPostsAsync();
        return Ok(sharedPosts);
    }

    [AllowAnonymous]
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetSharedPostsByUserId(int userId)
    {
        var sharedPosts = await _sharedPostService.GetSharedPostsByUserIdAsync(userId);
        return Ok(sharedPosts);
    }

    [HttpPost]
    public async Task<IActionResult> SharePost([FromBody] SharePostDto dto)
    {
        var userId = ClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized(new { message = "Invalid or missing user ID" });

        try
        {
            var sharedPost = await _sharedPostService.SharePostAsync(dto.PostId, userId.Value, dto.Content);
            return Ok(sharedPost);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSharedPost(int id)
    {
        var userId = ClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized(new { message = "Invalid or missing user ID" });

        try
        {
            var result = await _sharedPostService.DeleteSharedPostAsync(id, userId.Value);
            if (!result)
                return NotFound(new { message = "Bài chia sẻ không tồn tại" });

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSharedPost(int id, [FromBody] UpdateSharedPostDto dto)
    {
        var userId = ClaimsHelper.GetUserId(User);
        if (userId == null)
            return Unauthorized(new { message = "Invalid or missing user ID" });

        try
        {
            var updated = await _sharedPostService.UpdateSharedPostAsync(id, userId.Value, dto.Content);
            return Ok(updated);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class SharePostDto
{
    public int PostId { get; set; }
    public string? Content { get; set; }
}

public class UpdateSharedPostDto
{
    public string? Content { get; set; }
}
