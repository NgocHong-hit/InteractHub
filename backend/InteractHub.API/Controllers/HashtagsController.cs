using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InteractHub.API.Models;
using InteractHub.API.Repositories;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class HashtagsController : ControllerBase
{
    private readonly IHashtagRepository _hashtagRepository;

    public HashtagsController(IHashtagRepository hashtagRepository)
    {
        _hashtagRepository = hashtagRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllHashtags()
    {
        var hashtags = await _hashtagRepository.GetAllAsync();
        return Ok(hashtags);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetHashtagById(int id)
    {
        var hashtag = await _hashtagRepository.GetByIdAsync(id);
        if (hashtag == null)
            return NotFound(new { message = "Hashtag not found" });

        return Ok(hashtag);
    }

    [HttpGet("by-name/{name}")]
    public async Task<IActionResult> GetHashtagByName(string name)
    {
        var hashtag = await _hashtagRepository.GetByNameAsync(name);
        if (hashtag == null)
            return NotFound(new { message = "Hashtag not found" });

        return Ok(hashtag);
    }

    [HttpGet("trending/{limit}")]
    public async Task<IActionResult> GetTrendingHashtags(int limit = 10)
    {
        var hashtags = await _hashtagRepository.GetTrendingAsync(limit);
        var result = hashtags.Select(h => new
        {
            h.Id,
            h.Name,
            PostCount = h.PostHashtags?.Count ?? 0
        });
        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateHashtag([FromBody] CreateHashtagDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Hashtag name is required" });

        var existing = await _hashtagRepository.GetByNameAsync(dto.Name);
        if (existing != null)
            return BadRequest(new { message = "Hashtag already exists" });

        var hashtag = new Hashtag { Name = dto.Name };
        var created = await _hashtagRepository.CreateAsync(hashtag);
        return CreatedAtAction(nameof(GetHashtagById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateHashtag(int id, [FromBody] UpdateHashtagDto dto)
    {
        var hashtag = await _hashtagRepository.GetByIdAsync(id);
        if (hashtag == null)
            return NotFound(new { message = "Hashtag not found" });

        hashtag.Name = dto.Name ?? hashtag.Name;
        var updated = await _hashtagRepository.UpdateAsync(hashtag);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteHashtag(int id)
    {
        var success = await _hashtagRepository.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = "Hashtag not found" });

        return Ok(new { message = "Hashtag deleted successfully" });
    }
}

public class CreateHashtagDto
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateHashtagDto
{
    public string? Name { get; set; }
}
