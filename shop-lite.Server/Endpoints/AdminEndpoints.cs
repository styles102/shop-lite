using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/admin");

        group.MapPost("/auth/login", async (LoginRequest request, ShopDbContext db, IConfiguration config) =>
        {
            var user = await db.AdminUsers
                .FirstOrDefaultAsync(a => a.Email == request.Email);

            if (user is null || !SeedData.VerifyPassword(request.Password, user.PasswordHash))
                return Results.Unauthorized();

            var jwtSection = config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSection["Issuer"],
                audience: jwtSection["Audience"],
                claims: [new Claim(ClaimTypes.Email, user.Email)],
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds);

            return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        });

        group.MapGet("/orders", [Authorize] async (ShopDbContext db) =>
            await db.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .Take(20)
                .ToListAsync());

        return routes;
    }
}

record LoginRequest(string Email, string Password);
