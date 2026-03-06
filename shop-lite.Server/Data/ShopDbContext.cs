using Microsoft.EntityFrameworkCore;

public class ShopDbContext(DbContextOptions<ShopDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Basket> Baskets => Set<Basket>();
    public DbSet<BasketItem> BasketItems => Set<BasketItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Product>(e =>
        {
            e.HasKey(p => p.Sku);
            e.Property(p => p.Price).HasPrecision(10, 2);
            e.Property(p => p.SalePrice).HasPrecision(10, 2);
        });

        model.Entity<BasketItem>(e =>
        {
            e.HasOne(bi => bi.Product)
             .WithMany()
             .HasForeignKey(bi => bi.ProductSku)
             .OnDelete(DeleteBehavior.Cascade);
        });

        model.Entity<Order>(e =>
        {
            e.OwnsOne(o => o.BillingAddress);
            e.OwnsOne(o => o.DeliveryAddress);
            e.Property(o => o.OrderTotal).HasPrecision(10, 2);
        });

        model.Entity<OrderItem>(e =>
        {
            // No FK to Products — OrderItem is a price/name snapshot
            e.HasOne(oi => oi.Order)
             .WithMany(o => o.Items)
             .HasForeignKey(oi => oi.OrderId);
            e.Property(oi => oi.UnitPrice).HasPrecision(10, 2);
        });
    }
}
