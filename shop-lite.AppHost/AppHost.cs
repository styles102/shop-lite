var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("cache");

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume("shop-lite-postgres-data")
    .WithPgAdmin(pgAdmin => pgAdmin.WithHostPort(5050))
    .AddDatabase("shopdb");

var server = builder.AddProject<Projects.shop_lite_Server>("server")
    .WithReference(cache)
    .WithReference(postgres)
    .WaitFor(cache)
    .WaitFor(postgres)
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints();

var webfrontend = builder.AddJavaScriptApp("webfrontend", "../frontend", "dev")
    .WithReference(server)
    .WaitFor(server)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();
