const express = require("express");
const Router = express.Router();

const { GetAllCountries, CreateCountry } = require("../controllers/country_controller");

/**
 * @swagger
 * /api/countries:
 *  get:
 *    tags:
 *    - Country Controller
 *    summary: Get all countries
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    example: "Thailand"
 *                  code:
 *                    type: string
 *                    example: "THA"
 *      404:
 *        description: No Countries in database
 *      500:
 *        description: Server Error
 */
Router.get("/", GetAllCountries);

/**
 * @swagger
 * /api/countries:
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
 *              _id:
 *                type: string
 *                example: "666e584a18f6de5d775cb46c"
 *              name:
 *                type: string
 *                example: "United States"
 *              code:
 *                type: string
 *                example: "USA"
 *              __v:
 *                type: number
 *                example: 0
 *    responses:
 *      201:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                      example: "666e584a18f6de5d775cb46c"
 *                    name:
 *                      type: string
 *                      example: "United States"
 *                    code:
 *                      type: string
 *                      example: "USA"
 *                    __v:
 *                      type: number
 *                      example: 0
 *      400:
 *        description: Bad Request
 *      500:
 *        description: Server Error
 */
Router.post("/", CreateCountry);

module.exports = Router;