using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using InteractHub.API.Interfaces;
using InteractHub.API.DTOs.Responses;
using InteractHub.API.Common;

namespace InteractHub.API.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]   // Yêu cầu phải đăng nhập
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // Lấy tất cả thông báo của user hiện tại
        [HttpGet]
        public async Task<ActionResult<List<NotificationDto>>> GetNotifications([FromQuery] bool unreadOnly = false)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var notifications = await _notificationService.GetUserNotificationsAsync(userId, unreadOnly);
            return Ok(notifications);
        }

        // Đánh dấu 1 thông báo là đã đọc
        [HttpPut("{id}/read")]
        public async Task<ActionResult<ServiceResult>> MarkAsRead(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _notificationService.MarkAsReadAsync(userId, id);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // Đánh dấu tất cả là đã đọc
        [HttpPut("mark-all-read")]
        public async Task<ActionResult<ServiceResult>> MarkAllAsRead()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(result);
        }

        // Lấy số lượng thông báo chưa đọc
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(count);
        }
    }
}