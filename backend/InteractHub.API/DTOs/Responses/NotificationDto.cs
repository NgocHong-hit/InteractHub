namespace InteractHub.API.DTOs.Responses
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? SenderId { get; set; }
        public string SenderUserName { get; set; } = string.Empty;
        public string? SenderAvatarUrl { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}