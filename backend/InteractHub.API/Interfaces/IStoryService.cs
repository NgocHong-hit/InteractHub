using InteractHub.API.DTOs.Requests;
using InteractHub.API.DTOs.Responses;
using InteractHub.API.Common;

namespace InteractHub.API.Interfaces
{
    public interface IStoryService
    {
        Task<ServiceResult> CreateStoryAsync(int userId, CreateStoryDto dto);
        Task<ServiceResult> DeleteStoryAsync(int userId, int storyId);
        Task<List<StoryDto>> GetFriendsStoriesAsync(int userId);
        Task<List<StoryDto>> GetMyActiveStoriesAsync(int userId);
    }
}