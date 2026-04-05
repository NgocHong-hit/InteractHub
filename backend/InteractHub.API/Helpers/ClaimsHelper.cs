using System.Security.Claims;

namespace InteractHub.API.Helpers;

public static class ClaimsHelper
{
    public static int? GetUserId(ClaimsPrincipal user)
    {
        if (user == null)
            return null;

        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)
                      ?? user.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.NameId)
                      ?? user.FindFirst("nameid");

        if (idClaim == null || !int.TryParse(idClaim.Value, out var userId))
            return null;

        return userId;
    }
}
