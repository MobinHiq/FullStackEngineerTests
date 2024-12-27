# Rovio Game Configuration Manager

A web application for managing game configurations built with React and .NET Core, featuring a PostgreSQL database.

## Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v14 or later)
- [PostgreSQL](https://www.postgresql.org/download/) (v13 or later)

## Installation

1. Clone the repository:

2. Set up the PostgreSQL database:

   - Install PostgreSQL if not already installed
   - Create a new database named `rovio_configuration`
   - Default connection string uses:
     - Host: localhost
     - Database: rovio_configuration
     - Username: postgres
     - Password: 1
   - Update these values in `appsettings.json` if needed

3. Install and build the .NET solution:

4. Apply database migrations:

```bash
cd Rovio.Configuration.Net
dotnet ef database update
```

5. Install React dependencies:

```bash
cd ClientApp
npm install
```

## Running the Application

1. Start the application (this will run both the API and React app):

```bash
cd Rovio.Configuration.Net
dotnet run
```

The application will be available at:

- API: http://localhost:5000
- React Development Server: http://localhost:44454

## Running Tests

### Backend Tests

```bash
# Run all tests
dotnet test

# Run specific test projects
dotnet test Rovio.Configuration.Tests
dotnet test Rovio.Configuration.Net.Tests
dotnet test Rovio.Configuration.Repositories.Tests
```

### Frontend Tests

```bash
cd Rovio.Configuration.Net/ClientApp
npm test
```

## Features

- Create, read, update, and delete game configurations
- JSON configuration validation
- Search and filter configurations
- Responsive design with Material-UI
- Animated UI elements

## Technology Stack

### Frontend

- React (Functional Components)
- Material-UI
- React Router
- Jest & React Testing Library

### Backend

- ASP.NET Core 8.0
- Entity Framework Core 8.0
- PostgreSQL

## Project Structure

- `Rovio.Configuration.Net` - Main web application (React + .NET Core API)
- `Rovio.Configuration` - Core domain models and business logic
- `Rovio.Configuration.Repositories` - Data access layer with Entity Framework Core
- `Rovio.Configuration.Tests` - Core domain tests
- `Rovio.Configuration.Net.Tests` - Web application tests
- `Rovio.Configuration.Repositories.Tests` - Repository layer tests

## Development Notes

- Hot reload is enabled with `CHOKIDAR_USEPOLLING=true`
- The application uses SPA proxy for development
- Database migrations are handled through Entity Framework Core
- Tests are written using xUnit for backend and Jest for frontend

## License

This project is licensed under the MIT License - see the LICENSE file for details.
