using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InteractHub.API.Services;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly AdminService _adminService;

    public AdminController(AdminService adminService)
    {
        _adminService = adminService;
    }

    // ============ STATISTICS ============
    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics()
    {
        try
        {
            var result = await _adminService.GetStatistics();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ============ USER MANAGEMENT ============
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers(int page = 1, int pageSize = 20)
    {
        try
        {
            var result = await _adminService.GetAllUsers(page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUserDetails(int id)
    {
        try
        {
            var result = await _adminService.GetUserDetails(id);
            if (result == null)
                return NotFound(new { message = "User not found" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("users/{id}/block")]
    public async Task<IActionResult> BlockUser(int id)
    {
        try
        {
            var success = await _adminService.BlockUser(id);
            if (!success)
                return NotFound(new { message = "User not found" });

            return Ok(new { message = "User blocked successfully", userId = id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("users/{id}/unblock")]
    public async Task<IActionResult> UnblockUser(int id)
    {
        try
        {
            var success = await _adminService.UnblockUser(id);
            if (!success)
                return NotFound(new { message = "User not found" });

            return Ok(new { message = "User unblocked successfully", userId = id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var success = await _adminService.DeleteUser(id);
            if (!success)
                return NotFound(new { message = "User not found" });

            return Ok(new { message = "User deleted successfully", userId = id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ============ REPORT MANAGEMENT ============
    [HttpGet("reports")]
    public async Task<IActionResult> GetReports(string? status = null, int page = 1, int pageSize = 20)
    {
        try
        {
            var result = await _adminService.GetReports(status, page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("reports/{id}/approve")]
    public async Task<IActionResult> ApproveReport(int id)
    {
        try
        {
            var success = await _adminService.ApproveReport(id);
            if (!success)
                return NotFound(new { message = "Report not found" });

            return Ok(new { message = "Report approved and post deleted", reportId = id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("reports/{id}/reject")]
    public async Task<IActionResult> RejectReport(int id)
    {
        try
        {
            var success = await _adminService.RejectReport(id);
            if (!success)
                return NotFound(new { message = "Report not found" });

            return Ok(new { message = "Report rejected", reportId = id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ============ CONTENT MODERATION ============
    [HttpGet("posts")]
    public async Task<IActionResult> GetAllPosts(int page = 1, int pageSize = 20)
    {
        try
        {
            var result = await _adminService.GetAllPosts(page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("posts/{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        try
        {
            var success = await _adminService.DeletePost(id);
            if (!success)
                return NotFound(new { message = "Post not found" });

            return Ok(new { message = "Post deleted successfully", postId = id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        try
        {
            var success = await _adminService.DeleteComment(id);
            if (!success)
                return NotFound(new { message = "Comment not found" });

            return Ok(new { message = "Comment deleted successfully", commentId = id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ============ ACTIVITY LOGS ============
    [HttpGet("logs")]
    public async Task<IActionResult> GetActivityLogs(int page = 1, int pageSize = 20)
    {
        try
        {
            var result = await _adminService.GetActivityLogs(page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class AssignRoleDto
{
    public string Role { get; set; } = string.Empty;
}
