using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using InteractHub.API.Interfaces;
using InteractHub.API.DTOs.Requests;
using InteractHub.API.DTOs.Responses;
using InteractHub.API.Common;

namespace InteractHub.API.Controllers
{
    [ApiController]
    [Route("api/stories")]
    [Authorize]
    public class StoryController : ControllerBase
    {
        private readonly IStoryService _storyService;

        public StoryController(IStoryService storyService)
        {
            _storyService = storyService;
        }

        // Đăng Story mới
        [HttpPost]
        public async Task<ActionResult<ServiceResult>> CreateStory([FromBody] CreateStoryDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _storyService.CreateStoryAsync(userId, dto);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // Lấy Story của bạn bè (Newsfeed Story)
        [HttpGet("friends")]
        public async Task<ActionResult<List<StoryDto>>> GetFriendsStories()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var stories = await _storyService.GetFriendsStoriesAsync(userId);
            return Ok(stories);
        }

        // Lấy Story của chính mình
        [HttpGet("my")]
        public async Task<ActionResult<List<StoryDto>>> GetMyStories()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var stories = await _storyService.GetMyActiveStoriesAsync(userId);
            return Ok(stories);
        }

        // Xóa Story
        [HttpDelete("{storyId}")]
        public async Task<ActionResult<ServiceResult>> DeleteStory(int storyId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _storyService.DeleteStoryAsync(userId, storyId);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }
    }
}