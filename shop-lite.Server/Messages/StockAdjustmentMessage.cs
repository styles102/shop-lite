record StockAdjustmentMessage(Guid OrderId, List<StockAdjustmentItem> Items);

// QuantityDelta: negative = deduct stock, positive = restore stock
record StockAdjustmentItem(Guid ProductSku, int QuantityDelta);
