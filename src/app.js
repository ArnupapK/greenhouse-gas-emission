const express = require("express");
const BodyParser = require("body-parser");
const mongoose = require("mongoose");

const { ConnectDB } = require("./config/db");
const Country = require("./models/country");

const CountryRoute = require("./routes/country");
const EmissionRoute = require("./routes/emission");

ConnectDB();

const App = express();

App.use(BodyParser.json());

App.use("/api/countries", CountryRoute);
App.use("/api/emissions", EmissionRoute);

App.listen(5000);

// const Run = async () => {
//     try {
//         const countries = await Country.find();
//         console.log(countries);
//         process.exit(0);
//     } catch (error) {
//         console.error(error.message);
//         process.exit(1);
//     }
// }

// const app = express();
 
console.log("Server start");

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");

    // Run();

    // app.listen(5000);
})