namespace InteractHub.API.Common
{
    public class ServiceResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }

        private ServiceResult() { }

        public static ServiceResult Success(string message = "Thành công")
        {
            return new ServiceResult
            {
                IsSuccess = true,
                Message = message
            };
        }

        public static ServiceResult Success(object data, string message = "Thành công")
        {
            return new ServiceResult
            {
                IsSuccess = true,
                Message = message,
                Data = data
            };
        }

        public static ServiceResult Failure(string message)
        {
            return new ServiceResult
            {
                IsSuccess = false,
                Message = message
            };
        }
    }
}