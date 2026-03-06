public class Order
{
    public Guid Id { get; set; }
    public string CustomerEmail { get; set; } = string.Empty;
    public Address BillingAddress { get; set; } = new();
    public Address DeliveryAddress { get; set; } = new();
    public decimal OrderTotal { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Unpaid;
    public DeliveryStatus DeliveryStatus { get; set; } = DeliveryStatus.Processing;
    public ICollection<OrderItem> Items { get; set; } = [];
}

public enum OrderStatus { Unpaid, Paid }
public enum DeliveryStatus { Processing, Despatched, Delivered }
