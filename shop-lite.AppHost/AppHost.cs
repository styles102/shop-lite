var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("cache");

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume("shop-lite-postgres-data")
    .WithPgAdmin(pgAdmin => pgAdmin.WithHostPort(5050))
    .AddDatabase("shopdb");

var messaging = builder.AddRabbitMQ("messaging")
    .WithManagementPlugin();

var mailpit = builder.AddMailPit("mailpit");

var server = builder.AddProject<Projects.shop_lite_Server>("server")
    .WithReference(cache)
    .WithReference(postgres)
    .WithReference(messaging)
    .WaitFor(cache)
    .WaitFor(postgres)
    .WaitFor(messaging)
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints();

builder.AddProject<Projects.shop_lite_Worker>("worker")
    .WithReference(messaging)
    .WithReference(mailpit)
    .WaitFor(messaging);

var webfrontend = builder.AddJavaScriptApp("webfrontend", "../frontend", "dev")
    .WithReference(server)
    .WaitFor(server)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();
