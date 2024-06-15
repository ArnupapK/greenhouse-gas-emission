const express = require("express");
const Router = express.Router();

const { GetEmissionByCountryAndYear, GetEmissionBySector, CreateEmission } = require("../controllers/emission_controller");

Router.get("/", GetEmissionByCountryAndYear);
Router.get("/sector", GetEmissionBySector);
Router.post("/", CreateEmission);

module.exports = Router;