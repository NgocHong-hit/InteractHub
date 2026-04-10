using InteractHub.API.Data;
using InteractHub.API.DTOs.Responses;
using InteractHub.API.Helpers;
using InteractHub.API.Interfaces;
using InteractHub.API.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using InteractHub.API.Hubs;

namespace InteractHub.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(
            AppDbContext context,
            IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task CreateAndSendNotificationAsync(int receiverId, int? senderId, string type, string message)
        {
            var notification = new Notification
            {
                UserId = receiverId,
                SenderId = senderId,
                Type = type,
                Message = message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Gửi realtime qua SignalR
            var notificationDto = new NotificationDto
            {
                Id = notification.Id,
                UserId = notification.UserId,
                SenderId = notification.SenderId,
                Type = notification.Type,
                Message = notification.Message,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };

            // Gửi đến user cụ thể
            await _hubContext.Clients.User(receiverId.ToString())
                .SendAsync("ReceiveNotification", notificationDto);
        }

        public async Task<ServiceResult> MarkAsReadAsync(int userId, int notificationId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null)
                return ServiceResult.Failure("Không tìm thấy thông báo.");

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return ServiceResult.Success("Đã đánh dấu đã đọc.");
        }

        public async Task<ServiceResult> MarkAllAsReadAsync(int userId)
        {
            await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));

            return ServiceResult.Success("Đã đánh dấu tất cả thông báo là đã đọc.");
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool onlyUnread = false)
        {
            IQueryable<Notification> query = _context.Notifications
                .Include(n => n.Sender)
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt);

            if (onlyUnread)
                query = query.Where(n => !n.IsRead);

            var notifications = await query.ToListAsync();

            return notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                SenderId = n.SenderId,
                SenderUserName = n.Sender?.UserName ?? string.Empty,
                SenderAvatarUrl = n.Sender?.AvatarUrl,
                Type = n.Type,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            }).ToList();
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);
        }
    }
}