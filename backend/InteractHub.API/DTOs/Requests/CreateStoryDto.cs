namespace InteractHub.API.DTOs.Requests
{
    public class CreateStoryDto
    {
        public string? Content { get; set; }
        public string? MediaUrl { get; set; }
        public Microsoft.AspNetCore.Http.IFormFile? Image { get; set; }
    }
}