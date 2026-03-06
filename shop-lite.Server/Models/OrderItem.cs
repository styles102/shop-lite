public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public Guid ProductSku { get; set; }      // snapshot - no FK constraint
    public string ProductName { get; set; } = string.Empty;  // snapshot
    public decimal UnitPrice { get; set; }    // snapshot
    public int Quantity { get; set; }
}
