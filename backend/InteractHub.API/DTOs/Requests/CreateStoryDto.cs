namespace InteractHub.API.DTOs.Requests
{
    public class CreateStoryDto
    {
        public string? Content { get; set; }
        public string? MediaUrl { get; set; }   // Sau này sẽ upload lên Azure Blob
    }
}