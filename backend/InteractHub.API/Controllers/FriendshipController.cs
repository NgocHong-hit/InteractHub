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
    [Route("api/friendship")]
    [Authorize]                    // Yêu cầu phải đăng nhập
    public class FriendshipController : ControllerBase
    {
        private readonly IFriendshipService _friendshipService;

        public FriendshipController(IFriendshipService friendshipService)
        {
            _friendshipService = friendshipService;
        }

        // ====================== GỬI LỜI MỜI KẾT BẠN ======================
        [HttpPost("send")]
        public async Task<ActionResult<ServiceResult>> SendFriendRequest([FromBody] SendFriendRequestDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var result = await _friendshipService.SendFriendRequestAsync(userId, dto.ReceiverId);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // ====================== CHẤP NHẬN LỜI MỜI ======================
        [HttpPost("accept/{friendshipId}")]
        public async Task<ActionResult<ServiceResult>> AcceptFriendRequest(int friendshipId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var result = await _friendshipService.AcceptFriendRequestAsync(userId, friendshipId);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // ====================== TỪ CHỐI LỜI MỜI ======================
        [HttpPost("reject/{friendshipId}")]
        public async Task<ActionResult<ServiceResult>> RejectFriendRequest(int friendshipId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var result = await _friendshipService.RejectFriendRequestAsync(userId, friendshipId);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // ====================== XÓA BẠN BÈ ======================
        [HttpDelete("remove/{friendId}")]
        public async Task<ActionResult<ServiceResult>> RemoveFriend(int friendId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var result = await _friendshipService.RemoveFriendAsync(userId, friendId);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // ====================== LẤY DANH SÁCH BẠN BÈ ======================
        [HttpGet("friends")]
        public async Task<ActionResult<List<FriendDto>>> GetMyFriends()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var friends = await _friendshipService.GetMyFriendsAsync(userId);
            return Ok(friends);
        }

        // ====================== LẤY LỜI MỜI ĐANG CHỜ (Nhận được) ======================
        [HttpGet("pending-received")]
        public async Task<ActionResult<List<PendingFriendRequestDto>>> GetPendingReceivedRequests()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var requests = await _friendshipService.GetPendingReceivedRequestsAsync(userId);
            return Ok(requests);
        }

        // ====================== LẤY LỜI MỜI ĐÃ GỬI ======================
        [HttpGet("pending-sent")]
        public async Task<ActionResult<List<PendingFriendRequestDto>>> GetSentRequests()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var requests = await _friendshipService.GetSentRequestsAsync(userId);
            return Ok(requests);
        }
    }
}