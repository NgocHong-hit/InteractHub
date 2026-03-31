using System;

namespace InteractHub.API.Models
{
    public class Report
    {
    public int Id { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending"; // Pending, Resolved

    public int? PostId { get; set; }
    public virtual Post? Post { get; set; }
    public int ReporterId { get; set; }
    public virtual User Reporter { get; set; } = null!;
    }
}