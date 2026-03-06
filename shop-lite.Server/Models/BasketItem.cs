public class BasketItem
{
    public Guid Id { get; set; }
    public Guid BasketId { get; set; }
    public Basket Basket { get; set; } = null!;
    public Guid ProductSku { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
}
