const express = require("express");
const body_parser = require("body-parser");
const mongoose = require("mongoose");

const connect_db = require("./config/connect_db");
const country_schema = require("./models/country");


connect_db();

async function run() {
    const country = await country_schema.create({
        name: "hi",
        code: "eiei"
    })
    
    console.log(country);
}

const app = express();
 
console.log("Server start");

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");

    run();

    app.listen(5000);
})