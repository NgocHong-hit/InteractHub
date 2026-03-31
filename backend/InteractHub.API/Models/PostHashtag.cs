using System.Collections.Generic;

namespace InteractHub.API.Models
{
    public class PostHashtag
    {
    public int PostId { get; set; }
    public virtual Post Post { get; set; } = null!;
    public int HashtagId { get; set; }
    public virtual Hashtag Hashtag { get; set; } = null!;
    }
}