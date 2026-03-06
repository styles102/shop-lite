public class Basket
{
    public Guid Id { get; set; }
    public ICollection<BasketItem> Items { get; set; } = [];
}
