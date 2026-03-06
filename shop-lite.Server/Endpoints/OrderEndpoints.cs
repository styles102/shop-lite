using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;
using System.Text.Json;

public static class OrderEndpoints
{
    public static IEndpointRouteBuilder MapOrderEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/orders");

        group.MapPost("/", async (CreateOrderRequest request, ShopDbContext db, IConnection rabbitConnection) =>
        {
            var basket = await db.Baskets
                .Include(b => b.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(b => b.Id == request.BasketId);

            if (basket is null) return Results.NotFound();
            if (!basket.Items.Any()) return Results.BadRequest("Basket is empty.");

            var items = basket.Items.Select(i => new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductSku = i.ProductSku,
                ProductName = i.Product.Name,
                UnitPrice = i.Product.SalePrice ?? i.Product.Price,
                Quantity = i.Quantity
            }).ToList();

            var order = new Order
            {
                Id = Guid.NewGuid(),
                CustomerEmail = request.CustomerEmail,
                BillingAddress = request.BillingAddress,
                DeliveryAddress = request.DeliveryAddress,
                OrderTotal = items.Sum(i => i.UnitPrice * i.Quantity),
                Items = items
            };

            db.Orders.Add(order);
            db.Baskets.Remove(basket);
            await db.SaveChangesAsync();

            var msg = new OrderConfirmationMessage(
                order.Id,
                order.CustomerEmail,
                order.OrderTotal,
                items.Select(i => new OrderConfirmationItem(i.ProductName, i.Quantity, i.UnitPrice)).ToList());

            await using var channel = await rabbitConnection.CreateChannelAsync();
            await channel.QueueDeclareAsync("order-confirmations", durable: true,
                exclusive: false, autoDelete: false);
            await channel.BasicPublishAsync(
                exchange: "",
                routingKey: "order-confirmations",
                body: JsonSerializer.SerializeToUtf8Bytes(msg));

            return Results.Ok(new { order.Id });
        });

        group.MapGet("/{id:guid}", async (Guid id, ShopDbContext db) =>
        {
            var order = await db.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);

            return order is null ? Results.NotFound() : Results.Ok(order);
        });

        group.MapPatch("/{id:guid}", async (Guid id, UpdateOrderDeliveryRequest request, ShopDbContext db) =>
        {
            var order = await db.Orders.FindAsync(id);
            if (order is null) return Results.NotFound();

            if (order.DeliveryStatus is DeliveryStatus.Despatched or DeliveryStatus.Delivered)
                return Results.BadRequest("Delivery address cannot be changed once the order has been despatched.");

            order.DeliveryAddress = request.DeliveryAddress;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        return routes;
    }
}

record CreateOrderRequest(
    Guid BasketId,
    string CustomerEmail,
    Address BillingAddress,
    Address DeliveryAddress);

record UpdateOrderDeliveryRequest(Address DeliveryAddress);
