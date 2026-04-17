using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InteractHub.API.Interfaces;
using InteractHub.API.Models;
using Microsoft.IdentityModel.Tokens;

namespace InteractHub.API.Services
{
    public class TokenService : ITokenService
    {
        private readonly SymmetricSecurityKey _key;

        public TokenService(IConfiguration config)
        {
            var secretKey = "Day_La_Chuoi_Key_Sieu_Bao_Mat_Dai_Tren_64_Ky_Tu_De_Khong_Bao_Gio_Loi_Nua_123456";
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        }

        // CẬP NHẬT: Thêm tham số roles vào hàm
        public string CreateToken(User user, IList<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(JwtRegisteredClaimNames.GivenName, user.UserName ?? ""),
                new Claim(JwtRegisteredClaimNames.NameId, user.Id.ToString())
            };

            // Đưa các quyền (Admin/User) vào trong Token
            if (roles != null)
            {
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }
            }

            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}