# Emission Tracker API

This project provides an API for tracking greenhouse gas emissions by country, year, and sector.

## Prerequisites

- Node.js (version 14 or above)
- Docker and Docker Compose

## Setup

### Environment Variables

Create a `.env` file in the `src` directory and add the following environment variables:

```env
DATABASE_URL=<your_mongo_connection_string>
SERVER_PORT=<your_server_port>
DATABASE_FAILE=<your_database_file_in_csv_in_config_directory>

Install Dependencies
Run the following command to install the necessary Node.js packages:
    npm install

Running the Application
Using Docker
The application can be run using Docker. The provided start.sh script simplifies the process of starting, stopping, and injecting data into the database.

Starting the Application
To start the application, navigate to the project root directory and run:
    ./start.sh

This command will build and start the Docker containers defined in the docker-compose.yml file.

Stopping the Application
To stop the application, run:
    ./start.sh --stop

Injecting Data
To inject data from a CSV file into MongoDB, ensure the DATABASE_URL in .env file is set correctly, run:
    ./start.sh --inject-data

This will build and start the Docker containers defined in docker-compose.inject-db.yml.

Injecting Initial Data
If you are running the application for the first time, you need to inject the initial data into the MongoDB database.
    ./start.sh --inject-data

This command uses Docker Compose to set up the MongoDB database and load initial data from a CSV file located in the src/data_source/data/ directory.


API Documentation
API documentation is available via Swagger UI. Once the application is running, navigate to:
    http://localhost:<SERVER_PORT>/api-docs

Routes
Country Routes
GET /api/countries: Get all countries
POST /api/countries: Add a new country

Emission Routes
GET /api/emission: Get all emissions
POST /api/emission: Add a new emission
GET /api/emission/sector: Get an emission sector
GET /api/emission/trend: Get an emission trend

Running the Application without Docker
To run the application without Docker, ensure MongoDB is running locally and accessible via the DATABASE_URL in your .env file, and change the DATABASE_URL to localhost (ex. mongodb://mongodb:27017/greenhouse). Or start only MongoDB in docker using:
    ./start.sh --only-database

Then, start the application using Node.js:
    npm start

Project Structure
|- src/
    |- config/
        |- db.js:         Database connection configuration
        |- config.json:   Database configuration
    |- models/
        |- country.js:    Country model schema
        |- emission.js:   Emission model schema
    |- routes/
        |- country.js:    Routes for managing countries
        |- emission.js:   Routes for managing emissions
        |- 404.js:        nohandle route handler
    |- data_source/
        |- loader.js:     Database Injector
        |- data/
            |- data.csv:  Default database
    |- swagger_config.js: Swagger configuration for API documentation
    |- app.js:            Main application entry point
    |- pacakge.json       Node.js package configuration file
    |- route.rest         REST Client file for testing routes (vscode extension)
    |- .env               Environment variables configuration

|- docker/
    |- docker-compose.yml:           Docker Compose configuration for the application
    |- docker-compose.inject-db.yml: Docker Compose configuration for injecting data

|- start.sh: Script for managing Docker containers

Troubleshooting
If you encounter issues, ensure that:

Docker and Docker Compose are properly installed and running.
The .env file is correctly configured with your MongoDB connection string.
All dependencies are installed (npm install) when running locally.