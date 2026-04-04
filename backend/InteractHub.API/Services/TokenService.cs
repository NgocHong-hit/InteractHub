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
            // Dùng chung Key với Program.cs
            var secretKey = "Day_La_Chuoi_Key_Sieu_Bao_Mat_Dai_Tren_64_Ky_Tu_De_Khong_Bao_Gio_Loi_Nua_123456";
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        }

        public string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(JwtRegisteredClaimNames.GivenName, user.UserName ?? ""),
                new Claim(JwtRegisteredClaimNames.NameId, user.Id.ToString()) // Dùng NameId thay cho NameIdentifier
            };

            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = creds
                // Bỏ Issuer/Audience vì Program.cs đang để Validate = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}