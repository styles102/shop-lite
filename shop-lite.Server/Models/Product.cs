public class Product
{
    public Guid Sku { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int Stock { get; set; }
    public decimal Price { get; set; }
    public decimal? SalePrice { get; set; }
}
