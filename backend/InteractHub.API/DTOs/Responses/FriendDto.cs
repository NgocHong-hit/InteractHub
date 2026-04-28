namespace InteractHub.API.DTOs.Responses
{
    public class FriendDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public DateTime? FriendsSince { get; set; }
    }
}
