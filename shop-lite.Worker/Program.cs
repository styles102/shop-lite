using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);

builder.AddRabbitMQClient("messaging");
builder.AddNpgsqlDataSource("shopdb");
builder.Services.AddHostedService<OrderEmailConsumer>();
builder.Services.AddHostedService<StockAdjustmentConsumer>();

builder.Build().Run();
