const express = require("express");
const BodyParser = require("body-parser");

const { ConnectDB } = require("./config/db");

const SwaggerUi = require("swagger-ui-express");
const SwaggerSpec = require("./swagger_config");

const CountryRoute = require("./routes/country");
const EmissionRoute = require("./routes/emission");
const NoHandlerRouter = require("./routes/404");

ConnectDB();

const App = express();

App.use(BodyParser.json());
App.use(BodyParser.urlencoded({ extended: true }));

console.log(SwaggerSpec);
App.use("/docs", SwaggerUi.serve, SwaggerUi.setup(SwaggerSpec));

App.use("/api/countries", CountryRoute);
App.use("/api/emissions", EmissionRoute);
App.use(NoHandlerRouter);


App.listen(process.env.PORT || 5000);