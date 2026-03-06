using Npgsql;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text.Json;

public class StockAdjustmentConsumer(
    IConnection rabbitConnection,
    NpgsqlDataSource dataSource,
    ILogger<StockAdjustmentConsumer> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        logger.LogInformation("StockAdjustmentConsumer starting");

        await using var channel = await rabbitConnection.CreateChannelAsync(cancellationToken: ct);

        await channel.QueueDeclareAsync("stock-adjustments", durable: true,
            exclusive: false, autoDelete: false, cancellationToken: ct);

        await channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 1,
            global: false, cancellationToken: ct);

        var consumer = new AsyncEventingBasicConsumer(channel);
        consumer.ReceivedAsync += async (_, ea) =>
        {
            logger.LogInformation("Stock adjustment message received, delivery tag: {DeliveryTag}", ea.DeliveryTag);
            try
            {
                var message = JsonSerializer.Deserialize<StockAdjustmentMessage>(ea.Body.Span);
                if (message is not null)
                    await AdjustStockAsync(message, ct);

                await channel.BasicAckAsync(ea.DeliveryTag, multiple: false, cancellationToken: ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to process stock adjustment for delivery tag {DeliveryTag}", ea.DeliveryTag);
                await channel.BasicNackAsync(ea.DeliveryTag, multiple: false,
                    requeue: false, cancellationToken: ct);
            }
        };

        await channel.BasicConsumeAsync("stock-adjustments", autoAck: false,
            consumer: consumer, cancellationToken: ct);
        logger.LogInformation("StockAdjustmentConsumer registered, waiting for messages");

        await Task.Delay(Timeout.Infinite, ct);
    }

    private async Task AdjustStockAsync(StockAdjustmentMessage message, CancellationToken ct)
    {
        await using var conn = await dataSource.OpenConnectionAsync(ct);

        foreach (var item in message.Items)
        {
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                UPDATE "Products"
                SET "Stock" = GREATEST("Stock" + @delta, 0)
                WHERE "Sku" = @sku
                """;
            cmd.Parameters.AddWithValue("delta", item.QuantityDelta);
            cmd.Parameters.AddWithValue("sku", item.ProductSku);
            var rows = await cmd.ExecuteNonQueryAsync(ct);
            logger.LogInformation(
                "Order {OrderId}: adjusted stock for product {Sku} by {Delta} ({Rows} row updated)",
                message.OrderId, item.ProductSku, item.QuantityDelta, rows);
        }
    }
}
