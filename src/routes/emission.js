const express = require("express");
const Router = express.Router();

const {
    GetEmissionByCountryAndYear,
    GetEmissionBySector,
    GetEmissionTrendByCountry,
    CreateEmission
} = require("../controllers/emission_controller");

Router.get("/", GetEmissionByCountryAndYear);
Router.get("/sector", GetEmissionBySector);
Router.get("/trend", GetEmissionTrendByCountry);
Router.post("/", CreateEmission);

module.exports = Router;