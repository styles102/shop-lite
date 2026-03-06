using MailKit.Net.Smtp;
using MimeKit;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

public class OrderEmailConsumer(IConnection rabbitConnection, IConfiguration configuration, ILogger<OrderEmailConsumer> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        logger.LogInformation("OrderEmailConsumer starting");

        await using var channel = await rabbitConnection.CreateChannelAsync(cancellationToken: ct);
        logger.LogInformation("RabbitMQ channel created");

        await channel.QueueDeclareAsync("order-confirmations", durable: true,
            exclusive: false, autoDelete: false, cancellationToken: ct);
        logger.LogInformation("Queue 'order-confirmations' declared");

        await channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 1,
            global: false, cancellationToken: ct);

        var consumer = new AsyncEventingBasicConsumer(channel);
        consumer.ReceivedAsync += async (_, ea) =>
        {
            logger.LogInformation("Message received from queue, delivery tag: {DeliveryTag}", ea.DeliveryTag);
            try
            {
                if (logger.IsEnabled(LogLevel.Information))
                    logger.LogInformation("Message body: {Body}", Encoding.UTF8.GetString(ea.Body.Span));

                var message = JsonSerializer.Deserialize<OrderConfirmationMessage>(ea.Body.Span);
                if (message is not null)
                {
                    logger.LogInformation("Sending confirmation email to {Email} for order {OrderId}", message.CustomerEmail, message.OrderId);
                    await SendConfirmationEmailAsync(message, ct);
                    logger.LogInformation("Email sent successfully for order {OrderId}", message.OrderId);
                }
                else
                {
                    logger.LogWarning("Failed to deserialize message — body was null after deserialization");
                }

                await channel.BasicAckAsync(ea.DeliveryTag, multiple: false, cancellationToken: ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to process message with delivery tag {DeliveryTag}", ea.DeliveryTag);
                await channel.BasicNackAsync(ea.DeliveryTag, multiple: false,
                    requeue: false, cancellationToken: ct);
            }
        };

        await channel.BasicConsumeAsync("order-confirmations", autoAck: false,
            consumer: consumer, cancellationToken: ct);
        logger.LogInformation("Consumer registered, waiting for messages");

        await Task.Delay(Timeout.Infinite, ct);
    }

    private async Task SendConfirmationEmailAsync(OrderConfirmationMessage message, CancellationToken ct)
    {
        var connectionString = configuration.GetConnectionString("mailpit") ?? "smtp://localhost:1025";
        var uriString = connectionString.StartsWith("Endpoint=")
            ? connectionString["Endpoint=".Length..]
            : connectionString;

        var smtpUri = new Uri(uriString);

        var email = new MimeMessage();
        email.From.Add(new MailboxAddress("Shop Lite", "noreply@shop-lite.dev"));
        email.To.Add(MailboxAddress.Parse(message.CustomerEmail));
        email.Subject = $"Order confirmation #{message.OrderId.ToString()[..8].ToUpper()}";

        var body = new StringBuilder();
        body.AppendLine("Thank you for your order!");
        body.AppendLine();
        foreach (var item in message.Items)
            body.AppendLine($"  {item.ProductName} x{item.Quantity}  £{item.UnitPrice * item.Quantity:F2}");
        body.AppendLine();
        body.AppendLine($"Total: £{message.OrderTotal:F2}");

        email.Body = new TextPart("plain") { Text = body.ToString() };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(smtpUri.Host, smtpUri.Port,
            MailKit.Security.SecureSocketOptions.None, ct);
        await smtp.SendAsync(email, ct);
        await smtp.DisconnectAsync(quit: true, ct);
    }
}
