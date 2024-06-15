const SwaggerJsDoc = require("swagger-jsdoc");
const SwaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Greenhouse Gas Emissions API",
            version: "1.0.0",
            description: "API documentation for Greenhouse Gas Emissions Project"
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Development server"
            }
        ]
    },
    apis: [ "app.js", "./routes/*.js" ]
};

module.exports = SwaggerJsDoc(SwaggerOptions);