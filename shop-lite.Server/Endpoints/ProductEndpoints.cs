using Microsoft.EntityFrameworkCore;

public static class ProductEndpoints
{
    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/products");

        group.MapGet("/", async (ShopDbContext db) =>
            await db.Products.ToListAsync());

        group.MapGet("/{sku:guid}", async (Guid sku, ShopDbContext db) =>
        {
            var product = await db.Products.FindAsync(sku);
            return product is null ? Results.NotFound() : Results.Ok(product);
        });

        return routes;
    }
}
