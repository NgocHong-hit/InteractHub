using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InteractHub.API.Models;
using InteractHub.API.Interfaces;
using InteractHub.API.Data;
using InteractHub.API.Repositories;

namespace InteractHub.API.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ApiController]
    [Route("api/[controller]")]
    public class FriendshipController : ControllerBase
    {
        private readonly IFriendshipService _friendshipService;
        private readonly IFriendshipRepository _friendshipRepository;
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;

        public FriendshipController(
            IFriendshipService friendshipService,
            IFriendshipRepository friendshipRepository,
            AppDbContext context,
            UserManager<User> userManager)
        {
            _friendshipService = friendshipService;
            _friendshipRepository = friendshipRepository;
            _context = context;
            _userManager = userManager;
        }

        // Lấy ID từ JWT Token
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("nameid");
            if (userIdClaim == null)
                throw new UnauthorizedAccessException("Không tìm thấy định danh trong Token");
            return int.Parse(userIdClaim.Value);
        }

        // GET: api/friendship/all-users - Lấy tất cả user ngoài current user
        [HttpGet("all-users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var currentUserId = GetCurrentUserId();

                var users = await _userManager.Users
                    .Where(u => u.Id != currentUserId)
                    .Select(u => new
                    {
                        u.Id,
                        u.UserName,
                        u.Email,
                        u.FullName,
                        u.AvatarUrl,
                        u.Bio
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = users });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET: api/friendship/friends - Lấy danh sách bạn bè
        [HttpGet("friends")]
        public async Task<IActionResult> GetFriends()
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var friends = await _friendshipService.GetMyFriendsAsync(currentUserId);
                return Ok(new { success = true, data = friends });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET: api/friendship/pending-requests - Lấy lời mời kết bạn đang chờ
        [HttpGet("pending-requests")]
        public async Task<IActionResult> GetPendingRequests()
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var requests = await _friendshipService.GetPendingReceivedRequestsAsync(currentUserId);
                return Ok(new { success = true, data = requests });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET: api/friendship/sent-requests - Lấy lời mời đã gửi
        [HttpGet("sent-requests")]
        public async Task<IActionResult> GetSentRequests()
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var requests = await _friendshipService.GetSentRequestsAsync(currentUserId);
                return Ok(new { success = true, data = requests });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // POST: api/friendship/send-request - Gửi lời mời kết bạn
        [HttpPost("send-request")]
        public async Task<IActionResult> SendFriendRequest([FromBody] SendFriendRequestDto dto)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _friendshipService.SendFriendRequestAsync(currentUserId, dto.ReceiverId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // POST: api/friendship/accept - Chấp nhận lời mời
        [HttpPost("accept")]
        public async Task<IActionResult> AcceptFriendRequest([FromBody] AcceptFriendRequestDto dto)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _friendshipService.AcceptFriendRequestAsync(currentUserId, dto.FriendshipId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // POST: api/friendship/reject - Từ chối lời mời
        [HttpPost("reject")]
        public async Task<IActionResult> RejectFriendRequest([FromBody] RejectFriendRequestDto dto)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _friendshipService.RejectFriendRequestAsync(currentUserId, dto.FriendshipId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // DELETE: api/friendship/remove - Xóa bạn bè hoặc hủy lời mời
        [HttpDelete("remove/{friendId}")]
        public async Task<IActionResult> RemoveFriend(int friendId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _friendshipService.RemoveFriendAsync(currentUserId, friendId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET: api/friendship/check-status/{userId} - Kiểm tra trạng thái quan hệ với user
        [HttpGet("check-status/{userId}")]
        public async Task<IActionResult> CheckFriendshipStatus(int userId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var friendship = await _friendshipRepository.GetFriendshipBetweenAsync(currentUserId, userId);

                if (friendship == null)
                    return Ok(new { success = true, status = "none" });

                return Ok(new { success = true, status = friendship.Status.ToString(), friendshipId = friendship.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    // DTOs
    public class SendFriendRequestDto
    {
        public int ReceiverId { get; set; }
    }

    public class AcceptFriendRequestDto
    {
        public int FriendshipId { get; set; }
    }

    public class RejectFriendRequestDto
    {
        public int FriendshipId { get; set; }
    }
}
