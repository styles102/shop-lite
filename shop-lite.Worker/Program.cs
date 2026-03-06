using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);

builder.AddRabbitMQClient("messaging");
builder.Services.AddHostedService<OrderEmailConsumer>();

builder.Build().Run();
