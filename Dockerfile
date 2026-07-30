# Stage 1: Build de la aplicación .NET 10
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copiar archivos de proyecto (.csproj) y restaurar dependencias
COPY src/3DPrintingHub.slnx src/
COPY src/3DPrintingHub.Domain/*.csproj src/3DPrintingHub.Domain/
COPY src/3DPrintingHub.Application/*.csproj src/3DPrintingHub.Application/
COPY src/3DPrintingHub.Infrastructure/*.csproj src/3DPrintingHub.Infrastructure/
COPY src/3DPrintingHub.Api/*.csproj src/3DPrintingHub.Api/

RUN dotnet restore src/3DPrintingHub.slnx

# Copiar todo el código fuente y compilar
COPY src/ src/
WORKDIR /app/src/3DPrintingHub.Api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime ligero
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

ENTRYPOINT ["dotnet", "3DPrintingHub.Api.dll"]