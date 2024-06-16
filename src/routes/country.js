const express = require("express");
const Router = express.Router();

const { GetAllCountries, CreateCountry } = require("../controllers/country_controller");

/**
 * @swagger
 * /api/country:
 *  get:
 *    tags:
 *    - Country Controller
 *    summary: Get all countries
 *    responses:
 *      200:
 *        description: OK
 *      404:
 *        description: No Countries in database
 *      500:
 *        description: Server Error
 */
Router.get("/", GetAllCountries);

/**
 * @swagger
 * /api/country:
 *  post:
 *    tags:
 *    - Country Controller
 *    summary: Create a new country
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - code
 *            properties:
 *              name:
 *                type: string
 *                example: "United States"
 *              code:
 *                type: string
 *                example: "USA"
 *    responses:
 *      201:
 *        description: Created
 *      400:
 *        description: Bad Request
 *      500:
 *        description: Server Error
 */
Router.post("/", CreateCountry);

module.exports = Router;