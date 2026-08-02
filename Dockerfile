# Stage único: Runtime ligero de .NET 10 para ARM64
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY publish/ .

EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

ENTRYPOINT ["dotnet", "3DPrintingHub.Api.dll"]