using Microsoft.EntityFrameworkCore;

public static class BasketEndpoints
{
    public static IEndpointRouteBuilder MapBasketEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/baskets");

        group.MapPost("/", async (ShopDbContext db) =>
        {
            var basket = new Basket { Id = Guid.NewGuid() };
            db.Baskets.Add(basket);
            await db.SaveChangesAsync();
            return Results.Ok(new { basket.Id });
        });

        group.MapGet("/{id:guid}", async (Guid id, ShopDbContext db) =>
        {
            var basket = await db.Baskets
                .Include(b => b.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(b => b.Id == id);

            return basket is null ? Results.NotFound() : Results.Ok(basket);
        });

        group.MapPut("/{id:guid}/items/{productSku:guid}", async (
            Guid id, Guid productSku, UpsertBasketItemRequest request, ShopDbContext db) =>
        {
            var basket = await db.Baskets
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (basket is null) return Results.NotFound();

            var productExists = await db.Products.AnyAsync(p => p.Sku == productSku);
            if (!productExists) return Results.NotFound();

            var existing = basket.Items.FirstOrDefault(i => i.ProductSku == productSku);

            if (request.Quantity <= 0)
            {
                if (existing is not null)
                {
                    db.BasketItems.Remove(existing);
                    await db.SaveChangesAsync();
                }
                return Results.NoContent();
            }

            if (existing is not null)
            {
                existing.Quantity = request.Quantity;
            }
            else
            {
                db.BasketItems.Add(new BasketItem
                {
                    Id = Guid.NewGuid(),
                    BasketId = id,
                    ProductSku = productSku,
                    Quantity = request.Quantity
                });
            }

            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:guid}", async (Guid id, ShopDbContext db) =>
        {
            var basket = await db.Baskets.FindAsync(id);
            if (basket is null) return Results.NotFound();

            db.Baskets.Remove(basket);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        return routes;
    }
}

record UpsertBasketItemRequest(int Quantity);
