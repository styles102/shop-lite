record OrderConfirmationMessage(
    Guid OrderId,
    string CustomerEmail,
    decimal OrderTotal,
    List<OrderConfirmationItem> Items);

record OrderConfirmationItem(
    string ProductName,
    int Quantity,
    decimal UnitPrice);
