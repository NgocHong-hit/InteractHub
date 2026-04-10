using InteractHub.API.Interfaces;
using InteractHub.API.Repositories;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace InteractHub.API.Services
{
    public class StoryCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<StoryCleanupService> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromHours(1); // Chạy mỗi giờ 1 lần

        public StoryCleanupService(
            IServiceProvider serviceProvider,
            ILogger<StoryCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Story Cleanup Service đã bắt đầu.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupExpiredStoriesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi dọn dẹp Story hết hạn.");
                }

                await Task.Delay(_interval, stoppingToken);
            }
        }

        private async Task CleanupExpiredStoriesAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var storyRepository = scope.ServiceProvider.GetRequiredService<IStoryRepository>();

            var expiredStories = await storyRepository.GetExpiredStoriesAsync();

            if (expiredStories.Any())
            {
                _logger.LogInformation($"Đang xóa {expiredStories.Count} Story đã hết hạn.");

                foreach (var story in expiredStories)
                {
                    await storyRepository.DeleteAsync(story);
                }

                _logger.LogInformation($"Đã xóa thành công {expiredStories.Count} Story hết hạn.");
            }
            else
            {
                _logger.LogDebug("Không có Story nào hết hạn.");
            }
        }
    }
}