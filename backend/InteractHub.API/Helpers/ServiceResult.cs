namespace InteractHub.API.Helpers
{
    public class ServiceResult
    {
        public bool IsSuccess { get; init; }
        public string Message { get; init; } = string.Empty;

        public static ServiceResult Success(string message = "") => new ServiceResult
        {
            IsSuccess = true,
            Message = message
        };

        public static ServiceResult Failure(string message) => new ServiceResult
        {
            IsSuccess = false,
            Message = message
        };
    }
}
