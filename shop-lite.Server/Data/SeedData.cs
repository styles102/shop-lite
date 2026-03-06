using Microsoft.EntityFrameworkCore;

public static class SeedData
{
    public static async Task SeedAsync(ShopDbContext db)
    {
        if (await db.Products.AnyAsync()) return;

        db.Products.AddRange(
            new Product
            {
                Sku = Guid.Parse("f47ac10b-58cc-4372-8568-000000000001"),
                Name = "Classic White T-Shirt",
                Description = "A timeless wardrobe essential. 100% organic cotton, pre-shrunk and incredibly soft.",
                ImageUrl = null,
                Stock = 150,
                Price = 19.99m,
                SalePrice = null,
            },
            new Product
            {
                Sku = Guid.Parse("f47ac10b-58cc-4372-8568-000000000002"),
                Name = "Slim Fit Chinos",
                Description = "Versatile slim-fit chinos in stretch cotton. Perfect for smart-casual occasions.",
                ImageUrl = null,
                Stock = 80,
                Price = 49.99m,
                SalePrice = 34.99m,
            },
            new Product
            {
                Sku = Guid.Parse("f47ac10b-58cc-4372-8568-000000000003"),
                Name = "Leather Wallet",
                Description = "Slim bifold wallet in full-grain leather. Holds up to 8 cards plus notes.",
                ImageUrl = null,
                Stock = 200,
                Price = 29.99m,
                SalePrice = null,
            },
            new Product
            {
                Sku = Guid.Parse("f47ac10b-58cc-4372-8568-000000000004"),
                Name = "Running Trainers",
                Description = "Lightweight responsive running shoes with cushioned midsole and breathable mesh upper.",
                ImageUrl = null,
                Stock = 60,
                Price = 89.99m,
                SalePrice = 69.99m,
            },
            new Product
            {
                Sku = Guid.Parse("f47ac10b-58cc-4372-8568-000000000005"),
                Name = "Canvas Tote Bag",
                Description = "Sturdy heavy-duty canvas tote with internal zip pocket. Great for shopping or the gym.",
                ImageUrl = null,
                Stock = 120,
                Price = 14.99m,
                SalePrice = null,
            },
            new Product
            {
                Sku = Guid.Parse("f47ac10b-58cc-4372-8568-000000000006"),
                Name = "Merino Wool Jumper",
                Description = "Fine merino wool crew-neck jumper. Naturally temperature-regulating and machine washable.",
                ImageUrl = null,
                Stock = 45,
                Price = 79.99m,
                SalePrice = null,
            },
            new Product
            {
                Sku = Guid.Parse("f47ac10b-58cc-4372-8568-000000000007"),
                Name = "Stainless Water Bottle",
                Description = "Double-walled insulated bottle keeps drinks cold 24 hrs or hot 12 hrs. 500ml capacity.",
                ImageUrl = null,
                Stock = 300,
                Price = 24.99m,
                SalePrice = 18.99m,
            },
            new Product
            {
                Sku = Guid.Parse("f47ac10b-58cc-4372-8568-000000000008"),
                Name = "Polarised Sunglasses",
                Description = "UV400 polarised lenses in a lightweight acetate frame. Includes hard case and cloth.",
                ImageUrl = null,
                Stock = 0,
                Price = 59.99m,
                SalePrice = null,
            }
        );

        await db.SaveChangesAsync();
    }
}
