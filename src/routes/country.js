const express = require("express");
const Router = express.Router();

const { GetAllCountries, CreateCountry } = require("../controllers/country_controller");

Router.get("/", GetAllCountries);
Router.post("/", CreateCountry);

module.exports = Router;