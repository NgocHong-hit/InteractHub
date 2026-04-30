using Microsoft.AspNetCore.SignalR;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace InteractHub.API.Hubs
{
    public class NotificationHub : Hub
    {
        /// <summary>
        /// Lấy UserId từ claims — hỗ trợ cả ClaimTypes.NameIdentifier và "nameid"
        /// (vì DefaultInboundClaimTypeMap.Clear() ngăn auto-mapping)
        /// </summary>
        private string? GetUserId()
        {
            return Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? Context.User?.FindFirstValue(JwtRegisteredClaimNames.NameId)
                ?? Context.User?.FindFirstValue("nameid");
        }

        // Client sẽ gọi method này khi kết nối để ánh xạ UserId với ConnectionId
        public async Task RegisterUser()
        {
            var userId = GetUserId();
            if (!string.IsNullOrEmpty(userId))
            {
                // Thêm user vào group theo UserId (dùng để gửi thông báo chính xác)
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                await Clients.Caller.SendAsync("Registered", $"Đã đăng ký thông báo cho user {userId}");
            }
        }

        // Optional: Client có thể gọi để ngắt kết nối
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetUserId();
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}