using System.Collections.Generic;

namespace InteractHub.API.Models
{
    public class Hashtag
    {
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // ví dụ: #congnghe
    public virtual ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();
    }
}