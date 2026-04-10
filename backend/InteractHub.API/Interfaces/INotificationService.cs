using InteractHub.API.DTOs.Responses;
using InteractHub.API.Helpers;

namespace InteractHub.API.Interfaces
{
    public interface INotificationService
    {
        Task CreateAndSendNotificationAsync(int receiverId, int? senderId, string type, string message);
        Task<ServiceResult> MarkAsReadAsync(int userId, int notificationId);
        Task<ServiceResult> MarkAllAsReadAsync(int userId);
        Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool onlyUnread = false);
        Task<int> GetUnreadCountAsync(int userId);
    }
}