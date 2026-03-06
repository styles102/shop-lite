using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RabbitMQ.Client;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

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

        group.MapPatch("/orders/{id:guid}/status", [Authorize] async (
            Guid id,
            UpdateOrderStatusRequest request,
            ShopDbContext db,
            IConnection rabbitConnection) =>
        {
            var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
            if (order is null) return Results.NotFound();

            var valid = (order.Status, request.Status) switch
            {
                (OrderStatus.Unpaid, OrderStatus.Paid) => true,
                (OrderStatus.Paid, OrderStatus.Refunded) => true,
                _ => false
            };

            if (!valid)
                return Results.BadRequest($"Cannot transition from {order.Status} to {request.Status}.");

            order.Status = request.Status;
            await db.SaveChangesAsync();

            var delta = request.Status == OrderStatus.Paid ? -1 : 1;
            var msg = new StockAdjustmentMessage(
                order.Id,
                order.Items.Select(i => new StockAdjustmentItem(i.ProductSku, i.Quantity * delta)).ToList());

            await using var channel = await rabbitConnection.CreateChannelAsync();
            await channel.QueueDeclareAsync("stock-adjustments", durable: true,
                exclusive: false, autoDelete: false);
            await channel.BasicPublishAsync(
                exchange: "",
                routingKey: "stock-adjustments",
                body: JsonSerializer.SerializeToUtf8Bytes(msg));

            return Results.NoContent();
        });

        return routes;
    }
}

record LoginRequest(string Email, string Password);
record UpdateOrderStatusRequest(OrderStatus Status);
